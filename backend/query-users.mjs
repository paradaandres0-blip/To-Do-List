import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const users = await prisma.user.findMany();
  for (const u of users) {
    console.log(`${u.role.toUpperCase()} | ${u.email} | ${u.name} | password: ${u.password}`);
  }
} finally {
  await prisma.$disconnect();
}