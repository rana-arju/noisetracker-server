import { Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import config from '../../../config';
import prisma from '../../lib/prisma';

interface IEmployeeRow {
  employeeId: string;
  name: string;
  password?: string;
  email?: string;
  phone?: string;
  designation?: string;
}

const getBulkUploadPreview = async (filePath: string, fileType: string) => {
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

  const previewData: any[] = [];
  let summary = {
    total: rows.length,
    new: 0,
    existing: 0,
    invalid: 0,
  };

  for (const row of rows) {
    const { employeeId, name, password, email, phone, designation } = row as IEmployeeRow;

    // Validation: employeeId and name required
    if (!employeeId || !name) {
      summary.invalid++;
      previewData.push({
        ...row,
        status: 'INVALID',
        message: 'Missing employeeId or name',
      });
      continue;
    }

    const strEmployeeId = String(employeeId).trim();

    // Check for existing employee
    const existingUser = await prisma.user.findUnique({
      where: { employeeId: strEmployeeId },
    });

    if (existingUser) {
      summary.existing++;
      previewData.push({
        ...row,
        status: 'EXISTING',
        message: 'Employee ID already exists',
      });
    } else {
      summary.new++;
      previewData.push({
        ...row,
        status: 'NEW',
      });
    }
  }

  // Cleanup file after preview (optional, but good for security)
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  return {
    summary,
    previewData,
  };
};

const confirmBulkUpload = async (users: IEmployeeRow[]) => {
  const result = {
    inserted: 0,
    failed: 0,
    details: [] as any[],
  };

  for (const user of users) {
    const { employeeId, name, password, email, phone, designation } = user;

    try {
      // Final existence check before insertion
      const existingUser = await prisma.user.findUnique({
        where: { employeeId: String(employeeId).trim() },
      });

      if (existingUser) {
        result.failed++;
        result.details.push({ employeeId, status: 'FAILED', message: 'Already exists' });
        continue;
      }

      // Use provided password or default to employeeId if missing
      const passToHash = password ? String(password) : String(employeeId);
      const hashedPassword = await bcrypt.hash(passToHash, Number(config.bcrypt_salt_rounds));

      await prisma.user.create({
        data: {
          employeeId: String(employeeId).trim(),
          password: hashedPassword,
          name: name ? String(name).trim() : null,
          email: email ? String(email).trim() : null,
          phone: phone ? String(phone).trim() : null,
          designation: designation ? String(designation).trim() : null,
          role: Role.EMPLOYEE,
          status: UserStatus.ACTIVE,
          isActive: true,
        },
      });

      result.inserted++;
      result.details.push({ employeeId, status: 'INSERTED' });
    } catch (error: any) {
      result.failed++;
      result.details.push({ employeeId, status: 'FAILED', message: error.message });
    }
  }

  return result;
};

export const UsersBulkService = {
  getBulkUploadPreview,
  confirmBulkUpload,
};
