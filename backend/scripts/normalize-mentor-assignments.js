const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting mentor->activities normalization...');
  const groups = await prisma.group.findMany({ select: { id: true, name: true, centerId: true, programs: true } });
  const courses = await prisma.course.findMany({ select: { id: true, name: true } });

  let totalUpdated = 0;

  for (const g of groups) {
    const center = g.centerId ? await prisma.center.findUnique({ where: { id: g.centerId } }) : null;
    const centerName = String(center?.name ?? '').trim().toLowerCase();
    const programs = Array.isArray(g.programs) ? g.programs : [];

    for (const p of programs) {
      const programName = String(p?.program ?? '').trim().toLowerCase();
      const mentorName = String(p?.mentor ?? '').trim();
      if (!programName || !mentorName) continue;

      const teacher = await prisma.teacher.findFirst({ where: { name: mentorName } });
      if (!teacher) {
        console.warn(`No teacher found with name \"${mentorName}\" for group ${g.id}`);
        continue;
      }

      const matchingCourseIds = courses
        .filter((c) => {
          const parts = String(c.name ?? '').split(' - ');
          const cCenter = parts[0]?.trim().toLowerCase() ?? '';
          const cProgram = parts[1]?.trim().toLowerCase() ?? '';
          return cProgram === programName && (!centerName || cCenter === centerName);
        })
        .map((c) => c.id);

      if (matchingCourseIds.length === 0) continue;

      const modules = await prisma.module.findMany({ where: { courseId: { in: matchingCourseIds } }, select: { id: true } });
      const moduleIds = modules.map((m) => m.id);
      if (moduleIds.length === 0) continue;

      const update = await prisma.activity.updateMany({ where: { moduleId: { in: moduleIds } }, data: { teacherId: teacher.id } });
      totalUpdated += update.count ?? 0;
      console.log(`Group ${g.id}: program '${programName}' -> set ${update.count} activities to teacher ${teacher.name}`);
    }
  }

  console.log('Normalization completed. Total activities updated:', totalUpdated);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
