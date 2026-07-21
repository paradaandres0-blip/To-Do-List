import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createTestUsers() {
  console.log('🔐 Creando usuarios de prueba...');

  // Super Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@workflow.academy' },
    update: {},
    create: {
      email: 'admin@workflow.academy',
      password: await bcrypt.hash('Admin123!', 10),
      name: 'Super Admin',
      role: 'ADMIN',
    },
  });
  console.log('✅ Super Admin creado:', admin.email, 'Contraseña: Admin123!');

  // Docente
  const teacher = await prisma.user.upsert({
    where: { email: 'docente@workflow.academy' },
    update: {},
    create: {
      email: 'docente@workflow.academy',
      password: await bcrypt.hash('Docente123!', 10),
      name: 'Docente Demo',
      role: 'INSTRUCTOR',
    },
  });
  console.log('✅ Docente creado:', teacher.email, 'Contraseña: Docente123!');

  // Estudiante
  const student = await prisma.user.upsert({
    where: { email: 'estudiante@workflow.academy' },
    update: {},
    create: {
      email: 'estudiante@workflow.academy',
      password: await bcrypt.hash('Estudiante123!', 10),
      name: 'Estudiante Demo',
      role: 'STUDENT',
    },
  });
  console.log('✅ Estudiante creado:', student.email, 'Contraseña: Estudiante123!');

  console.log('\n📋 Credenciales de prueba:');
  console.log('=====================================');
  console.log('🔴 SUPER ADMIN');
  console.log('Email: admin@workflow.academy');
  console.log('Contraseña: Admin123!');
  console.log('=====================================');
  console.log('🟡 DOCENTE');
  console.log('Email: docente@workflow.academy');
  console.log('Contraseña: Docente123!');
  console.log('=====================================');
  console.log('🟢 ESTUDIANTE');
  console.log('Email: estudiante@workflow.academy');
  console.log('Contraseña: Estudiante123!');
  console.log('=====================================');
}

createTestUsers()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
