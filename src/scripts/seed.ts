import { PrismaClient, Role, UserStatus, ReportStatus, Severity, VoteType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const hash = (pw: string) => bcrypt.hash(pw, 12);

const seed = async () => {
  console.log('🌱 Starting seed...');

  // 0. Clear existing data
  await prisma.reportVote.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.report.deleteMany();
  await prisma.user.deleteMany();
  console.log('🧹 Database cleared');

  // 1. Create superadmin
  let superadmin = await prisma.user.create({
      data: {
        employeeId: '10001',
        name: 'Super Admin',
        email: 'superadmin@smtech.com',
        password: await hash('superadmin123'),
        role: Role.SUPERADMIN,
        status: UserStatus.ACTIVE,
        isActive: true,
      },
    });
    console.log('✅ Superadmin created');

  // 2. Create admin
  let admin = await prisma.user.create({
      data: {
        employeeId: '10002',
        name: 'Admin User',
        email: 'admin@smtech.com',
        password: await hash('admin123'),
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
        isActive: true,
      },
    });
    console.log('✅ Admin created');

  // 3. Create employees
  const employees = [
    { employeeId: '11612', name: 'Arif Hossain', email: 'arif@smtech.com', password: 'emp123' },
    { employeeId: '11623', name: 'Mitu Begum', email: 'mitu@smtech.com', password: 'emp123' },
    { employeeId: '11801', name: 'Karim Uddin', email: 'karim@smtech.com', password: 'emp123' },
    { employeeId: '11905', name: 'Sadia Islam', email: 'sadia@smtech.com', password: 'emp123' },
  ];

  const createdEmployees: any[] = [];
  for (const e of employees) {
    let user = await prisma.user.findUnique({ where: { employeeId: e.employeeId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          employeeId: e.employeeId,
          name: e.name,
          email: e.email,
          password: await hash(e.password),
          role: Role.EMPLOYEE,
          status: UserStatus.ACTIVE,
          isActive: true,
        },
      });
      console.log(`✅ Employee created: ${e.employeeId} / ${e.password}`);
    }
    createdEmployees.push(user);
  }

  // 4. Create reports
  const reportData = [
    {
      reportedEmployeeName: 'Karim Uddin',
      reportedEmployeeId: '11801',
      description: 'Excessive noise during lunch break near Block C.',
      severity: Severity.HIGH,
      status: ReportStatus.APPROVED,
      createdById: createdEmployees[0].id,
    },
    {
      reportedEmployeeName: 'Sadia Islam',
      reportedEmployeeId: '11905',
      description: 'Playing loud music in shared workspace.',
      severity: Severity.MEDIUM,
      status: ReportStatus.APPROVED,
      createdById: createdEmployees[1].id,
    },
    {
      reportedEmployeeName: 'Arif Hossain',
      reportedEmployeeId: '11612',
      description: 'Disturbing colleagues with repeated phone calls.',
      severity: Severity.LOW,
      status: ReportStatus.PENDING,
      createdById: createdEmployees[2].id,
    },
  ];

  const createdReports: any[] = [];
  for (const r of reportData) {
    const existing = await prisma.report.findFirst({
      where: {
        reportedEmployeeId: r.reportedEmployeeId,
        createdById: r.createdById,
      },
    });
    if (!existing) {
      const report = await prisma.report.create({ data: r });
      createdReports.push(report);
      console.log(`✅ Report created for ${r.reportedEmployeeName}`);
    } else {
      createdReports.push(existing);
    }
  }

  // 5. Add comments on approved reports
  for (const report of createdReports.filter((r) => r.status === 'APPROVED')) {
    const commentCount = await prisma.comment.count({ where: { reportId: report.id } });
    if (commentCount === 0) {
      await prisma.comment.create({
        data: {
          reportId: report.id,
          userId: createdEmployees[3].id,
          content: 'This has been going on for weeks!',
        },
      });
      await prisma.comment.create({
        data: {
          reportId: report.id,
          userId: admin!.id,
          content: 'We are looking into this matter.',
        },
      });
      console.log(`✅ Comments added for report ${report.id}`);
    }
  }

  // 6. Add votes
  for (const report of createdReports.filter((r) => r.status === 'APPROVED')) {
    try {
      await prisma.reportVote.create({
        data: { reportId: report.id, userId: createdEmployees[1].id, voteType: VoteType.UPVOTE },
      });
      await prisma.reportVote.create({
        data: { reportId: report.id, userId: createdEmployees[3].id, voteType: VoteType.UPVOTE },
      });
      console.log(`✅ Votes added for report ${report.id}`);
    } catch {
      // Votes already exist
    }
  }

  console.log('\n🎉 Seed complete!');
  console.log('──────────────────────────────────────────');
  console.log('Superadmin → employeeId: 10001, password: superadmin123');
  console.log('Admin      → employeeId: 10002, password: admin123');
  console.log('Employee 1 → employeeId: 11612, password: emp123');
  console.log('Employee 2 → employeeId: 11623, password: emp123');
  console.log('Employee 3 → employeeId: 11801, password: emp123');
  console.log('Employee 4 → employeeId: 11905, password: emp123');
};

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
