import { PrismaClient } from '@prisma/client';

process.env.DATABASE_URL = 'postgresql://postgres:1234@localhost:5432/workflow_academy';

const prisma = new PrismaClient();

const testConnection = async (): Promise<void> => {
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test query
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Test query successful!');
    
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

testConnection();
