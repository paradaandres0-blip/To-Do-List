import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

(async () => {
  const counts = await Promise.all([
    prisma.user.count(),
    prisma.teacher.count(),
    prisma.student.count(),
    prisma.center.count(),
    prisma.group.count(),
    prisma.course.count(),
    prisma.module.count(),
    prisma.activity.count(),
  ]);

  console.log(JSON.stringify({
    users: counts[0],
    teachers: counts[1],
    students: counts[2],
    centers: counts[3],
    groups: counts[4],
    courses: counts[5],
    modules: counts[6],
    activities: counts[7],
  }, null, 2));

  const demoUser = await prisma.user.findUnique({ where: { email: 'docente@workflow.academy' } });
  console.log('demoTeacherUser', JSON.stringify(demoUser, null, 2));
  const demoStudent = await prisma.student.findFirst({ where: { email: 'estudiante@workflow.academy' } });
  console.log('demoStudent', JSON.stringify(demoStudent, null, 2));

  await prisma.$disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
