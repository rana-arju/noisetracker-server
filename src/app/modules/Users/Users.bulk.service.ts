import { Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import config from '../../../config';
import prisma from '../../lib/prisma';

interface IEmployeeRow {
  employeeId: string;
  password?: string;
  name?: string;
  email?: string;
  phone?: string;
}

const bulkUploadEmployees = async (filePath: string, fileType: string) => {
  let rows: any[] = [];

  if (fileType === 'csv') {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    rows = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  } else {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    rows = XLSX.utils.sheet_to_json(worksheet);
  }

  let totalRows = rows.length;
  let insertedRows = 0;
  let skippedRows = 0;
  let invalidRows = 0;
  const details: any[] = [];

  for (const row of rows) {
    const { employeeId, password, name, email, phone } = row as IEmployeeRow;

    // Basic validation
    if (!employeeId || !password) {
      invalidRows++;
      details.push({ employeeId: employeeId || 'N/A', status: 'INVALID', message: 'Missing employeeId or password' });
      continue;
    }

    const strEmployeeId = String(employeeId).trim();

    // Check for existing employee
    const existingUser = await prisma.user.findUnique({
      where: { employeeId: strEmployeeId },
    });

    if (existingUser) {
      skippedRows++;
      details.push({ employeeId: strEmployeeId, status: 'SKIPPED', message: 'Duplicate employeeId' });
      continue;
    }

    try {
      const hashedPassword = await bcrypt.hash(String(password), Number(config.bcrypt_salt_rounds));

      await prisma.user.create({
        data: {
          employeeId: strEmployeeId,
          password: hashedPassword,
          name: name ? String(name).trim() : null,
          email: email ? String(email).trim() : null,
          phone: phone ? String(phone).trim() : null,
          role: Role.EMPLOYEE,
          status: UserStatus.ACTIVE,
          isActive: true,
        },
      });

      insertedRows++;
      details.push({ employeeId: strEmployeeId, status: 'INSERTED' });
    } catch (error: any) {
      invalidRows++;
      details.push({ employeeId: strEmployeeId, status: 'FAILED', message: error.message });
    }
  }

  // Cleanup file
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  return {
    summary: {
      totalRows,
      insertedRows,
      skippedRows,
      invalidRows,
    },
    details,
  };
};

export const UsersBulkService = {
  bulkUploadEmployees,
};
