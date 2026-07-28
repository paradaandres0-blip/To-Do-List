import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { email: { in: ['docente@workflow.academy', 'estudiante@workflow.academy'] } },
    include: { teacher: true, student: true },
  });
  console.log('USERS', users.map((u) => ({
    email: u.email,
    role: u.role,
    teacherId: u.teacher?.id,
    studentId: u.student?.id,
  })));

  const groups = await prisma.group.findMany({ where: { name: 'Cohorte Fitness 2026' } });
  console.log('GROUPS', groups.map((g) => ({ id: g.id, name: g.name, programs: g.programs, active: g.active })));

  const courses = await prisma.course.findMany({ where: { name: { contains: 'Entrenamiento Funcional', mode: 'insensitive' } } });
  console.log('COURSES', courses.map((c) => ({ id: c.id, name: c.name, groups: c.groups, status: c.status })));

  const students = await prisma.student.findMany({ where: { userId: { not: null } } });
  console.log('STUDENTS_WITH_USERID', students.length, students.slice(0, 5).map((s) => ({
    email: s.email,
    program: s.program,
    group: s.group,
    teacherId: s.teacherId,
    userId: s.userId,
  })));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
