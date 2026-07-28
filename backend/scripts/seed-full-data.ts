import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting full data seed...');

  // 1) Centers
  const centersData = [
    { name: 'Centro Básico', website: 'basico.example.com', plan: 'Básico' },
    { name: 'Centro Pro', website: 'pro.example.com', plan: 'Pro' },
  ];

  const centers = [] as any[];
  for (const c of centersData) {
    let center = await prisma.center.findFirst({ where: { name: c.name } });
    if (!center) {
      center = await prisma.center.create({ data: { name: c.name, website: c.website, plan: c.plan, active: true } });
    } else {
      await prisma.center.update({ where: { id: center.id }, data: { website: c.website, plan: c.plan } });
      center = await prisma.center.findUnique({ where: { id: center.id } });
    }
    centers.push(center);
    console.log('Center ensured:', center.name);
  }

  // 2) Programs (create course per center+program so modules are center-scoped)
  const programs = ['Entrenamiento Funcional', 'Nutrición Deportiva', 'Mindfulness'];
  const courses: any[] = [];
  for (const center of centers) {
    for (const program of programs) {
      const courseName = `${center.name} - ${program}`;
      let course = await prisma.course.findFirst({ where: { name: courseName } });
      if (!course) {
        course = await prisma.course.create({ data: { name: courseName, description: `Curso ${program} en ${center.name}`, duration: 8, status: 'ACTIVO', groups: '' } });
      } else {
        await prisma.course.update({ where: { id: course.id }, data: { description: `Curso ${program} en ${center.name}`, duration: 8 } });
        course = await prisma.course.findUnique({ where: { id: course.id } });
      }
      courses.push({ course, center, program });
      console.log('Course ensured:', course.name);
    }
  }

  // 3) Create modules per course (weekly modules), 8 modules each
  const MODULES_PER_COURSE = 8;
  for (const entry of courses) {
    for (let i = 1; i <= MODULES_PER_COURSE; i++) {
      const title = `Semana ${i} - ${entry.program}`;
      let mod = await prisma.module.findFirst({ where: { title, courseId: entry.course.id } });
      if (!mod) {
        await prisma.module.create({ data: { title, courseId: entry.course.id, lessons: 1, duration: '1 semana', status: 'ACTIVO' } });
      } else {
        await prisma.module.update({ where: { id: mod.id }, data: { lessons: 1, duration: '1 semana', status: 'ACTIVO' } });
      }
    }
    console.log(`Modules ensured for course: ${entry.course.name}`);
  }

  // 4) Create teachers (6)
  const teacherNames = ['Ana Gómez', 'Carlos Ruiz', 'María Pérez', 'Luis Fernández', 'Sofía Martínez', 'Jorge Sánchez'];
  const teachers: any[] = [];
  for (const [i, name] of teacherNames.entries()) {
    const email = `${name.toLowerCase().replace(/\s+/g, '.')}@workflow.academy`;
    let teacher = await prisma.teacher.findFirst({ where: { email } });
    if (!teacher) {
      teacher = await prisma.teacher.create({ data: { name, email, phone: `+57 300 000 00${i}`, city: 'Bogotá', specialties: programs.join(','), status: 'ACTIVO' } });
    } else {
      await prisma.teacher.update({ where: { id: teacher.id }, data: { name, phone: `+57 300 000 00${i}`, city: 'Bogotá', specialties: programs.join(','), status: 'ACTIVO' } });
      teacher = await prisma.teacher.findUnique({ where: { id: teacher.id } });
    }
    teachers.push(teacher);
    console.log('Teacher ensured:', teacher.email);
  }

  // 5) Create 2 groups per center and assign program(s) & mentors
  const groups: any[] = [];
  for (const center of centers) {
    for (let idx = 1; idx <= 2; idx++) {
      const groupName = `${center.name} - Grupo ${idx}`;
      const program = programs[(idx - 1) % programs.length];
      const mentor = teachers[(idx - 1) % teachers.length];
      const programsJson = [{ program, mentor: mentor.name }];
      let group = await prisma.group.findFirst({ where: { name: groupName } });
      if (!group) {
        group = await prisma.group.create({ data: { name: groupName, centerId: center.id, status: 'INSCRIPCIONES', active: true, programs: programsJson } });
      } else {
        await prisma.group.update({ where: { id: group.id }, data: { centerId: center.id, status: 'INSCRIPCIONES', active: true, programs: programsJson } });
        group = await prisma.group.findUnique({ where: { id: group.id } });
      }
      groups.push({ group, program });
      console.log('Group ensured:', group.name, 'program:', program, 'mentor:', mentor.name);
    }
  }

  // 6) Create students: 25 per group and assign teacher round-robin
  const STUDENTS_PER_GROUP = 25;
  let studentCounter = 1;
  for (const g of groups) {
    for (let s = 0; s < STUDENTS_PER_GROUP; s++) {
      const name = `Estudiante ${studentCounter}`;
      const email = `student${studentCounter}@example.com`;
      const assignedTeacher = teachers[(studentCounter - 1) % teachers.length];
      await prisma.student.create({
        data: {
          name,
          email,
          phone: `+57 310 200 ${String(studentCounter).padStart(4, '0')}`,
          program: g.program,
          group: g.group.name,
          status: 'ACTIVO',
          active: true,
          teacherId: assignedTeacher.id,
        },
      });
      studentCounter++;
    }
    console.log(`Created ${STUDENTS_PER_GROUP} students for group ${g.group.name}`);
  }

  // 7) Create activities to link modules with teachers (assignment)
  // For each course's modules assign a teacher round-robin
  for (const entry of courses) {
    const modules = await prisma.module.findMany({ where: { courseId: entry.course.id } });
    for (const [i, mod] of modules.entries()) {
      const teacher = teachers[i % teachers.length];
      await prisma.activity.create({
        data: {
          title: `Actividad ${i + 1}`,
          description: `Actividad generada para ${mod.title}`,
          moduleId: mod.id,
          teacherId: teacher.id,
          status: 'PENDIENTE',
        },
      });
    }
    console.log(`Assigned teachers to modules for course ${entry.course.name}`);
  }

  console.log('\n🎉 Full seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Error during full seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
