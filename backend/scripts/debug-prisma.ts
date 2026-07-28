import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Prisma introspection:');
  console.log('Has user:', typeof (prisma as any).user !== 'undefined');
  console.log('Has teacher:', typeof (prisma as any).teacher !== 'undefined');
  console.log('Has center:', typeof (prisma as any).center !== 'undefined');
  console.log('Has group:', typeof (prisma as any).group !== 'undefined');
  console.log('Client keys:', Object.keys(prisma as any).slice(0,50));
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
