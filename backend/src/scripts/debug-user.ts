import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({ where: { email: 'admin@workflow.academy' } });
    console.log(user ? JSON.stringify(user, null, 2) : 'USER_NOT_FOUND');
  } catch (error) {
    console.error('ERROR', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
