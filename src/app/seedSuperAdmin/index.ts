import { Role, UserStatus, ReportStatus, Severity, VoteType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import prisma from '../lib/prisma';

const seedSuperAdmin = async () => {
  try {
    const exists = await prisma.user.findFirst({ where: { role: Role.SUPERADMIN } });
    if (!exists) {
      const hash = await bcrypt.hash('superadmin123', 12);
      await prisma.user.create({
        data: {
          employeeId: '10001',
          name: 'Super Admin',
          password: hash,
          role: Role.SUPERADMIN,
          status: UserStatus.ACTIVE,
          isActive: true,
        },
      });
      console.log('✅ Super Admin seeded: employeeId=10001, password=superadmin123');
    }
  } catch (error) {
    console.error('Error seeding Super Admin', error);
  }
};

export default seedSuperAdmin;
