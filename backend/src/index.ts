
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import logger from './config/logger';
import authRoutes from './routes/authRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { authenticateToken } from './middleware/auth';
import { connectDatabase, prisma } from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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
  return {
    id: module.id,
    course: course?.name ?? '',
    title: module.title,
    lessons: module.lessons ?? 0,
    duration: module.duration ?? '0h',
    status: normalizeStatus(module.status),
    progress: module.progress ?? 0,
  };
};

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Workflow Academy Backend is running' });
});

// Auth middleware para obtener usuario actual
app.get('/api/auth/me', authenticateToken, async (req: any, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});


app.get('/api/teachers', async (_req, res, next) => {
  try {
    const teachers = await prisma.teacher.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: teachers.map(mapTeacher) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/teachers', async (req, res, next) => {
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
    res.status(201).json({ success: true, data: mapTeacher(teacher) });
  } catch (error) {
    next(error);
  }
});

app.put('/api/teachers/:id', async (req, res, next) => {
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
    res.json({ success: true, data: mapTeacher(teacher) });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/teachers/:id', async (req, res, next) => {
  try {
    await prisma.teacher.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.get('/api/students', async (_req, res, next) => {
  try {
    const students = await prisma.student.findMany({ orderBy: { joinedAt: 'desc' } });
    res.json({ success: true, data: students.map(mapStudent) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/students', async (req, res, next) => {
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
    res.status(201).json({ success: true, data: mapStudent(student) });
  } catch (error) {
    next(error);
  }
});

app.put('/api/students/:id', async (req, res, next) => {
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
    res.json({ success: true, data: mapStudent(student) });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/students/:id', async (req, res, next) => {
  try {
    await prisma.student.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.get('/api/courses', async (_req, res, next) => {
  try {
    const courses = await prisma.course.findMany({ orderBy: { createdAt: 'desc' } });
    const mapped = await Promise.all(courses.map(mapCourse));
    res.json({ success: true, data: mapped });
  } catch (error) {
    next(error);
  }
});

app.post('/api/courses', async (req, res, next) => {
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
    res.status(201).json({ success: true, data: await mapCourse(course) });
  } catch (error) {
    next(error);
  }
});

app.put('/api/courses/:id', async (req, res, next) => {
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
    res.json({ success: true, data: await mapCourse(course) });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/courses/:id', async (req, res, next) => {
  try {
    await prisma.course.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.get('/api/modules', async (_req, res, next) => {
  try {
    const modules = await prisma.module.findMany({ orderBy: { createdAt: 'desc' } });
    const mapped = await Promise.all(modules.map(mapModule));
    res.json({ success: true, data: mapped });
  } catch (error) {
    next(error);
  }
});

app.post('/api/modules', async (req, res, next) => {
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
    res.status(201).json({ success: true, data: await mapModule(module) });
  } catch (error) {
    next(error);
  }
});

app.put('/api/modules/:id', async (req, res, next) => {
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
    res.json({ success: true, data: await mapModule(module) });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/modules/:id', async (req, res, next) => {
  try {
    await prisma.module.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Tasks
app.get('/api/tasks', async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.task.count(),
    ]);

    res.json({
      success: true,
      data: tasks.map((t) => ({
        id: t.id,
        title: t.title,
        course: t.course,
        due: t.due,
        priority: t.priority,
        status: t.status,
        updatedAt: t.updatedAt,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/tasks', async (req, res, next) => {
  try {
    const task = await prisma.task.create({
      data: {
        title: req.body.title,
        course: req.body.course,
        due: req.body.due,
        priority: req.body.priority,
        status: req.body.status,
      },
    });
    res.status(201).json({
      success: true,
      data: {
        id: task.id,
        title: task.title,
        course: task.course,
        due: task.due,
        priority: task.priority,
        status: task.status,
        updatedAt: task.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.put('/api/tasks/:id', async (req, res, next) => {
  try {
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        title: req.body.title,
        course: req.body.course,
        due: req.body.due,
        priority: req.body.priority,
        status: req.body.status,
      },
    });
    res.json({
      success: true,
      data: {
        id: task.id,
        title: task.title,
        course: task.course,
        due: task.due,
        priority: task.priority,
        status: task.status,
        updatedAt: task.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/tasks/:id', async (req, res, next) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Reports
app.get('/api/reports', async (req, res, next) => {
  try {
    const [students, sessions] = await Promise.all([
      prisma.student.findMany(),
      prisma.reportSession.findMany(),
    ]);

    res.json({
      success: true,
      data: {
        students: students.map((s) => ({
          id: s.id,
          name: s.name,
          program: s.program,
          joinedAt: s.joinedAt,
          status: s.status,
          progress: s.progress,
        })),
        sessions: sessions.map((s) => ({
          id: s.id,
          course: s.course,
          date: s.date,
          status: s.status,
          duration: s.duration,
        })),
        programs: Array.from(new Set(students.map((s) => s.program))),
      },
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/reports/sessions', async (req, res, next) => {
  try {
    const session = await prisma.reportSession.create({
      data: {
        course: req.body.course,
        date: req.body.date,
        status: req.body.status,
        duration: req.body.duration,
      },
    });
    res.status(201).json({
      success: true,
      data: {
        id: session.id,
        course: session.course,
        date: session.date,
        status: session.status,
        duration: session.duration,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.put('/api/reports/sessions/:id', async (req, res, next) => {
  try {
    const session = await prisma.reportSession.update({
      where: { id: req.params.id },
      data: {
        course: req.body.course,
        date: req.body.date,
        status: req.body.status,
        duration: req.body.duration,
      },
    });
    res.json({
      success: true,
      data: {
        id: session.id,
        course: session.course,
        date: session.date,
        status: session.status,
        duration: session.duration,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/reports/sessions/:id', async (req, res, next) => {
  try {
    await prisma.reportSession.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Metrics
app.get('/api/metrics/dashboard', async (_req, res, next) => {
  try {
    const [studentsActive, studentsTotal, programsActive, sessionsCompleted] = await Promise.all([
      prisma.student.count({ where: { status: 'ACTIVO' } }),
      prisma.student.count(),
      prisma.course.count({ where: { status: 'ACTIVO' } }),
      prisma.reportSession.count({ where: { status: 'COMPLETADA' } }),
    ]);

    res.json({
      success: true,
      data: {
        studentsActive,
        studentsTotal,
        programsActive,
        sessionsCompleted,
        satisfaction: 96,
        trends: {
          students: '+12%',
          programs: '+5%',
          sessions: '+18%',
          satisfaction: '+2%',
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Activities
app.get('/api/activities', async (req, res, next) => {
  try {
    const teacherId = req.query.teacherId as string | undefined;
    const studentId = req.query.studentId as string | undefined;

    let activities = await prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (teacherId) {
      activities = activities.filter((a) => a.teacherId === teacherId);
    }
    if (studentId) {
      activities = activities.filter((a) => a.studentId === studentId);
    }

    res.json({
      success: true,
      data: activities.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        moduleId: a.moduleId,
        course: a.course,
        studentId: a.studentId,
        teacherId: a.teacherId,
        lesson: a.lesson,
        status: a.status,
        progress: a.progress,
        attachmentUrl: a.attachmentUrl,
        attachmentName: a.attachmentName,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/activities', async (req, res, next) => {
  try {
    const activity = await prisma.activity.create({
      data: {
        title: req.body.title,
        description: req.body.description,
        moduleId: req.body.moduleId,
        course: req.body.course,
        studentId: req.body.studentId,
        teacherId: req.body.teacherId,
        lesson: req.body.lesson,
        status: req.body.status,
        progress: req.body.progress,
        attachmentUrl: req.body.attachmentUrl,
        attachmentName: req.body.attachmentName,
      },
    });
    res.status(201).json({
      success: true,
      data: {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        moduleId: activity.moduleId,
        course: activity.course,
        studentId: activity.studentId,
        teacherId: activity.teacherId,
        lesson: activity.lesson,
        status: activity.status,
        progress: activity.progress,
        attachmentUrl: activity.attachmentUrl,
        attachmentName: activity.attachmentName,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.put('/api/activities/:id', async (req, res, next) => {
  try {
    const activity = await prisma.activity.update({
      where: { id: req.params.id },
      data: {
        title: req.body.title,
        description: req.body.description,
        status: req.body.status,
        progress: req.body.progress,
        attachmentUrl: req.body.attachmentUrl,
        attachmentName: req.body.attachmentName,
      },
    });
    res.json({
      success: true,
      data: {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        moduleId: activity.moduleId,
        course: activity.course,
        studentId: activity.studentId,
        teacherId: activity.teacherId,
        lesson: activity.lesson,
        status: activity.status,
        progress: activity.progress,
        attachmentUrl: activity.attachmentUrl,
        attachmentName: activity.attachmentName,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/activities/:id', async (req, res, next) => {
  try {
    await prisma.activity.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

const seedDatabase = async () => {
  const teacherCount = await prisma.teacher.count();
  if (teacherCount > 0) return;

  const teacher = await prisma.teacher.create({
    data: {
      name: 'Ana Gómez',
      email: 'ana.gomez@workflow.academy',
      phone: '+57 300 555 0101',
      city: 'Bogotá',
      specialties: 'Nutrición Deportiva, Bienestar Mental',
      status: 'ACTIVO',
    },
  });

  await prisma.student.create({
    data: {
      name: 'Sofía Pérez',
      email: 'sofia.perez@workflow.academy',
      phone: '+57 301 111 2222',
      program: 'Entrenamiento Funcional',
      group: 'Cohorte Fitness 2026',
      status: 'ACTIVO',
      active: true,
      teacherId: teacher.id,
    },
  });

  const course = await prisma.course.create({
    data: {
      name: 'Entrenamiento Funcional Completo',
      description: 'Programa base para el seguimiento académico.',
      duration: 12,
      status: 'ACTIVO',
      groups: 'Cohorte Fitness 2026',
    },
  });

  await prisma.module.createMany({
    data: [
      {
        title: 'Fundamentos del Movimiento',
        courseId: course.id,
        lessons: 4,
        duration: '4h 30m',
        status: 'ACTIVO',
        progress: 100,
      },
      {
        title: 'Hipertrofia y Fuerza',
        courseId: course.id,
        lessons: 5,
        duration: '5h 20m',
        status: 'ACTIVO',
        progress: 78,
      },
    ],
  });
};

// Start server
const startServer = async () => {
  try {
    await connectDatabase();
    await seedDatabase();
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();

export default app;


