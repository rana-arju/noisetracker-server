import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Total users:', users.length);
  users.forEach(u => {
    console.log(`ID: ${u.id}, EmployeeId: ${u.employeeId}, Email: ${u.email}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
