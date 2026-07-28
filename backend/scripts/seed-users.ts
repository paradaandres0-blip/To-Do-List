import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('123456', 10);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@workflow.academy' },
    update: {},
    create: {
      email: 'admin@workflow.academy',
      password: hash,
      name: 'Administrador',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin creado:', admin.email);

  // Docente
  const instructor = await prisma.user.upsert({
    where: { email: 'docente@workflow.academy' },
    update: {},
    create: {
      email: 'docente@workflow.academy',
      password: hash,
      name: 'Docente Demo',
      role: 'INSTRUCTOR',
    },
  });
  console.log('✅ Docente creado:', instructor.email);

  // Estudiante
  const student = await prisma.user.upsert({
    where: { email: 'estudiante@workflow.academy' },
    update: {},
    create: {
      email: 'estudiante@workflow.academy',
      password: hash,
      name: 'Estudiante Demo',
      role: 'STUDENT',
    },
  });
  console.log('✅ Estudiante creado:', student.email);

  // Crear profesor asociado para el instructor (vinculado al userId)
  const teacher = await prisma.teacher.upsert({
    where: { userId: instructor.id },
    update: {
      name: 'Docente Demo',
      email: 'docente@workflow.academy',
      phone: '+57 300 555 0101',
      city: 'Medellín',
      specialties: 'Nutrición Deportiva,Entrenamiento Funcional',
      status: 'ACTIVO',
    },
    create: {
      name: 'Docente Demo',
      email: 'docente@workflow.academy',
      phone: '+57 300 555 0101',
      city: 'Medellín',
      specialties: 'Nutrición Deportiva,Entrenamiento Funcional',
      status: 'ACTIVO',
      userId: instructor.id,
    },
  });
  console.log('✅ Teacher profile creado:', teacher.email);

  // Crear perfil de estudiante para el estudiante
  await prisma.student.upsert({
    where: { userId: student.id },
    update: {
      name: 'Estudiante Demo',
      email: 'estudiante@workflow.academy',
      phone: '+57 301 111 2222',
      program: 'Entrenamiento Funcional',
      group: 'Cohorte Fitness 2026',
      status: 'ACTIVO',
      active: true,
      teacherId: teacher.id,
    },
    create: {
      name: 'Estudiante Demo',
      email: 'estudiante@workflow.academy',
      phone: '+57 301 111 2222',
      program: 'Entrenamiento Funcional',
      group: 'Cohorte Fitness 2026',
      status: 'ACTIVO',
      active: true,
      teacherId: teacher.id,
      userId: student.id,
    },
  });
  console.log('✅ Student profile creado');

  console.log('\n🎉 Usuarios de prueba creados exitosamente');
  console.log('📧 Todos tienen la contraseña: 123456');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });