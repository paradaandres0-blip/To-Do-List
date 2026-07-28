import { Router } from 'express';
import { prisma } from '../config/database';

const router = Router();

const toApiResponse = (data: unknown) => ({ success: true, data });
const normalizeStatus = (value?: string | null): string => {
  const upper = (value ?? '').toUpperCase();
  if (upper === 'ACTIVO' || upper === 'ACTIVE') return 'Activo';
  if (upper === 'INACTIVO' || upper === 'INACTIVE') return 'Inactivo';
  if (upper === 'PENDIENTE') return 'Pendiente';
  return value ?? 'Activo';
};
const parseStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
  return [];
};
const mapTeacher = (teacher: any) => ({
  id: teacher.id,
  name: teacher.name,
  email: teacher.email,
  phone: teacher.phone,
  city: teacher.city,
  specialties: parseStringArray(teacher.specialties),
  status: normalizeStatus(teacher.status),
  createdAt: teacher.createdAt?.toISOString?.() ?? teacher.createdAt,
  updatedAt: teacher.updatedAt?.toISOString?.() ?? teacher.updatedAt,
});
const mapStudent = (student: any) => ({
  id: student.id,
  name: student.name,
  email: student.email,
  phone: student.phone,
  program: student.program,
  group: student.group,
  centerId: student.centerId,
  status: normalizeStatus(student.status),
  active: student.active ?? true,
  sessions: student.sessionsCount ?? 0,
  progress: student.progress ?? 0,
  joinedAt: student.joinedAt?.toISOString?.() ?? student.joinedAt,
  teacherId: student.teacherId,
});
const mapCourse = async (course: any) => {
  const modulesCount = await prisma.module.count({ where: { courseId: course.id } });
  return {
    id: course.id,
    title: course.name,
    description: course.description ?? '',
    groups: parseStringArray(course.groups),
    modulesCount,
    status: normalizeStatus(course.status),
    lastUpdate: course.updatedAt?.toISOString?.() ?? course.updatedAt,
  };
};
const mapModule = async (module: any) => {
  const course = await prisma.course.findUnique({ where: { id: module.courseId } });
  let assignedTeacherId: string | null = null;
  let assignedTeacherName: string | null = null;
  try {
    const courseName = String(course?.name ?? '');
    const parts = courseName.split(' - ');
    const centerPart = parts[0]?.trim().toLowerCase() ?? '';
    const programPart = parts[1]?.trim().toLowerCase() ?? '';
    if (programPart) {
      const groups = await prisma.group.findMany({ where: { active: true } });
      for (const g of groups) {
        const gName = String(g.name ?? '').toLowerCase();
        if (centerPart && !gName.includes(centerPart)) continue;
        const programs = Array.isArray(g.programs) ? g.programs : [];
        for (const p of programs) {
          const prog = String(p?.program ?? '').toLowerCase();
          const mentor = String(p?.mentor ?? '').trim();
          if (prog === programPart && mentor) {
            const teacher = await prisma.teacher.findFirst({ where: { name: mentor } });
            if (teacher) {
              assignedTeacherId = teacher.id;
              assignedTeacherName = teacher.name;
              break;
            }
          }
        }
        if (assignedTeacherId) break;
      }
    }
  } catch (err) {
    console.error('Error deriving assigned teacher for module:', err);
  }

  return {
    id: module.id,
    course: course?.name ?? '',
    title: module.title,
    lessons: module.lessons ?? 0,
    duration: module.duration ?? '0h',
    status: normalizeStatus(module.status),
    progress: module.progress ?? 0,
    assignedTeacherId,
    assignedTeacherName,
  };
};

// Teachers
router.get('/teachers', async (_req, res, next) => {
  try {
    const teachers = await prisma.teacher.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(toApiResponse(teachers.map(mapTeacher)));
  } catch (error) {
    next(error);
  }
});

router.get('/teachers/:id', async (req, res, next) => {
  try {
    const teacher = await prisma.teacher.findUnique({ where: { id: req.params.id } });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
    res.json(toApiResponse(mapTeacher(teacher)));
  } catch (error) {
    next(error);
  }
});

router.post('/teachers', async (req, res, next) => {
  try {
    const teacher = await prisma.teacher.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone ?? '',
        city: req.body.city ?? '',
        specialties: Array.isArray(req.body.specialties) ? req.body.specialties.join(',') : '',
        status: (req.body.status ?? 'Activo').toUpperCase(),
      },
    });
    res.status(201).json(toApiResponse(mapTeacher(teacher)));
  } catch (error) {
    next(error);
  }
});

router.put('/teachers/:id', async (req, res, next) => {
  try {
    const teacher = await prisma.teacher.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        city: req.body.city,
        specialties: Array.isArray(req.body.specialties) ? req.body.specialties.join(',') : undefined,
        status: req.body.status ? String(req.body.status).toUpperCase() : undefined,
      },
    });
    res.json(toApiResponse(mapTeacher(teacher)));
  } catch (error) {
    next(error);
  }
});

router.delete('/teachers/:id', async (req, res, next) => {
  try {
    await prisma.teacher.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Students
router.get('/students', async (_req, res, next) => {
  try {
    const students = await prisma.student.findMany({ orderBy: { joinedAt: 'desc' } });
    res.json(toApiResponse(students.map(mapStudent)));
  } catch (error) {
    next(error);
  }
});

router.get('/students/:id', async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json(toApiResponse(mapStudent(student)));
  } catch (error) {
    next(error);
  }
});

router.post('/students', async (req, res, next) => {
  try {
    const student = await prisma.student.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone ?? '',
        program: req.body.program ?? '',
        group: req.body.group ?? '',
        status: (req.body.status ?? 'Pendiente').toUpperCase(),
        active: req.body.active ?? true,
        teacherId: req.body.teacherId ?? undefined,
      },
    });
    res.status(201).json(toApiResponse(mapStudent(student)));
  } catch (error) {
    next(error);
  }
});

router.put('/students/:id', async (req, res, next) => {
  try {
    const student = await prisma.student.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        program: req.body.program,
        group: req.body.group,
        status: req.body.status ? String(req.body.status).toUpperCase() : undefined,
        active: req.body.active,
        teacherId: req.body.teacherId,
      },
    });
    res.json(toApiResponse(mapStudent(student)));
  } catch (error) {
    next(error);
  }
});

router.delete('/students/:id', async (req, res, next) => {
  try {
    await prisma.student.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Courses
router.get('/courses', async (_req, res, next) => {
  try {
    const courses = await prisma.course.findMany({ orderBy: { createdAt: 'desc' } });
    const mapped = await Promise.all(courses.map(mapCourse));
    res.json(toApiResponse(mapped));
  } catch (error) {
    next(error);
  }
});

router.get('/courses/:id', async (req, res, next) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json(toApiResponse(await mapCourse(course)));
  } catch (error) {
    next(error);
  }
});

router.post('/courses', async (req, res, next) => {
  try {
    const course = await prisma.course.create({
      data: {
        name: req.body.title,
        description: req.body.description,
        duration: req.body.duration ?? 0,
        status: (req.body.status ?? 'Inactivo').toUpperCase(),
        groups: Array.isArray(req.body.groups) ? req.body.groups.join(',') : '',
      },
    });
    res.status(201).json(toApiResponse(await mapCourse(course)));
  } catch (error) {
    next(error);
  }
});

router.put('/courses/:id', async (req, res, next) => {
  try {
    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: {
        name: req.body.title,
        description: req.body.description,
        duration: req.body.duration,
        status: req.body.status ? String(req.body.status).toUpperCase() : undefined,
        groups: Array.isArray(req.body.groups) ? req.body.groups.join(',') : undefined,
      },
    });
    res.json(toApiResponse(await mapCourse(course)));
  } catch (error) {
    next(error);
  }
});

router.delete('/courses/:id', async (req, res, next) => {
  try {
    await prisma.course.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Modules
router.get('/modules', async (_req, res, next) => {
  try {
    const modules = await prisma.module.findMany({ orderBy: { createdAt: 'desc' } });
    const mapped = await Promise.all(modules.map(mapModule));
    res.json(toApiResponse(mapped));
  } catch (error) {
    next(error);
  }
});

router.get('/modules/:id', async (req, res, next) => {
  try {
    const module = await prisma.module.findUnique({ where: { id: req.params.id } });
    if (!module) return res.status(404).json({ success: false, message: 'Module not found' });
    res.json(toApiResponse(await mapModule(module)));
  } catch (error) {
    next(error);
  }
});

router.post('/modules', async (req, res, next) => {
  try {
    const courseName = req.body.course;
    const course = courseName ? await prisma.course.findFirst({ where: { name: courseName } }) : null;
    const module = await prisma.module.create({
      data: {
        title: req.body.title,
        courseId: course?.id ?? req.body.courseId,
        lessons: req.body.lessons ?? 0,
        duration: req.body.duration ?? '0h',
        status: (req.body.status ?? 'Activo').toUpperCase(),
        progress: req.body.progress ?? 0,
      },
    });
    res.status(201).json(toApiResponse(await mapModule(module)));
  } catch (error) {
    next(error);
  }
});

router.put('/modules/:id', async (req, res, next) => {
  try {
    const courseName = req.body.course;
    const course = courseName ? await prisma.course.findFirst({ where: { name: courseName } }) : null;
    const module = await prisma.module.update({
      where: { id: req.params.id },
      data: {
        title: req.body.title,
        courseId: course?.id ?? req.body.courseId,
        lessons: req.body.lessons,
        duration: req.body.duration,
        status: req.body.status ? String(req.body.status).toUpperCase() : undefined,
        progress: req.body.progress,
      },
    });
    res.json(toApiResponse(await mapModule(module)));
  } catch (error) {
    next(error);
  }
});

router.delete('/modules/:id', async (req, res, next) => {
  try {
    await prisma.module.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
