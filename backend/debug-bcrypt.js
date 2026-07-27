const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
(async () => {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({ where: { email: 'admin@workflow.academy' } });
    console.log('USER:', user ? JSON.stringify(user, null, 2) : 'USER_NOT_FOUND');
    if (user) {
      const valid = await bcrypt.compare('Admin123!', user.password);
      console.log('BCRYPT_VALID:', valid);
    }
  } catch (error) {
    console.error('ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
})();
