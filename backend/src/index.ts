
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import logger from './config/logger';
import bcrypt from 'bcrypt';
import authRoutes from './routes/authRoutes';
import { createCentersRouter } from './routes/centers';
import { createGroupsRouter } from './routes/groups';
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

const sanitizeActivityTitle = (title: string | null | undefined, fallbackIndex?: number) => {
  const raw = String(title ?? '').trim();
  if (!raw) return fallbackIndex ? `Actividad ${fallbackIndex}` : 'Actividad';

  const isTeacherAssignmentTitle = /^(asignación docente|asignacion docente|docente asignado)\s*[:\-]?\s*/i.test(raw);
  if (!isTeacherAssignmentTitle) return raw;

  return fallbackIndex ? `Actividad ${fallbackIndex}` : 'Actividad';
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

const mapStudent = async (student: any) => {
  const context = await resolveStudentGroupContext(student);
  return {
    id: student.id,
    name: student.name,
    email: student.email,
    phone: student.phone,
    program: context.resolvedProgram,
    group: context.resolvedGroup,
    centerId: context.centerId,
    status: normalizeStatus(student.status),
    active: student.active ?? true,
    sessions: student.sessionsCount ?? 0,
    progress: student.progress ?? 0,
    joinedAt: student.joinedAt?.toISOString?.() ?? student.joinedAt,
    teacherId: student.teacherId,
  };
};

const getGroupByName = async (groupName?: string) => {
  if (!groupName) return null;
  return prisma.group.findFirst({ where: { name: groupName }, select: { id: true, name: true, centerId: true, programs: true } });
};

const getProgramForGroup = async (groupName?: string): Promise<string> => {
  if (!groupName) return '';
  const group = await getGroupByName(groupName);
  if (!group || !group.programs) return '';

  const programs = Array.isArray(group.programs) ? group.programs : [];
  const firstProgram = programs.find((item): item is { program: string } => typeof item === 'object' && item !== null && 'program' in item && typeof (item as { program?: unknown }).program === 'string');

  return firstProgram?.program ?? '';
};

const resolveStudentGroupContext = async (student: { group?: string | null; program?: string | null; teacherId?: string | null }) => {
  const groupName = student.group?.trim() || '';
  const group = groupName ? await getGroupByName(groupName) : null;
  const groupPrograms = Array.isArray(group?.programs) ? group.programs : [];
  const firstProgramAssignment = groupPrograms.find((item): item is { program: string; mentor?: string } => typeof item === 'object' && item !== null && 'program' in item && typeof (item as { program?: unknown }).program === 'string');
  const resolvedProgram = student.program?.trim() || firstProgramAssignment?.program || '';
  const resolvedGroup = group?.name || groupName || '';

  return {
    resolvedGroup,
    resolvedProgram,
    groupId: group?.id ?? null,
    centerId: group?.centerId ?? null,
    mentor: firstProgramAssignment?.mentor ?? null,
  };
};

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

const generateRandomPassword = (len = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let pw = '';
  for (let i = 0; i < len; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
};

// Middleware
app.use(helmet());
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/centers', createCentersRouter());
app.use('/api/groups', createGroupsRouter());

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

    const teacher = await prisma.teacher.findUnique({ where: { userId } });
    const student = await prisma.student.findUnique({ where: { userId } });

    res.json({
      success: true,
      data: {
        ...user,
        teacherId: teacher?.id,
        studentId: student?.id,
      },
    });
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

app.get('/api/teachers/:id', async (req, res, next) => {
  try {
    const teacher = await prisma.teacher.findUnique({ where: { id: req.params.id } });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
    res.json({ success: true, data: mapTeacher(teacher) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/teachers', async (req, res, next) => {
  try {
    // Prevent duplicate user by email
    const existing = await prisma.user.findUnique({ where: { email: req.body.email } });
    if (existing) return res.status(400).json({ success: false, message: 'Ya existe un usuario con ese correo' });

    const plain = req.body.password ?? generateRandomPassword(8);
    const hashed = await bcrypt.hash(plain, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: { email: req.body.email, password: hashed, name: req.body.name, role: 'INSTRUCTOR' } });
      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          name: req.body.name,
          email: req.body.email,
          phone: req.body.phone ?? '',
          city: req.body.city ?? '',
          specialties: Array.isArray(req.body.specialties) ? req.body.specialties.join(',') : '',
          status: (req.body.status ?? 'Activo').toUpperCase(),
        },
      });
      return { user, teacher };
    });

    res.status(201).json({ success: true, data: { ...mapTeacher(result.teacher), generatedPassword: plain } });
  } catch (error) {
    next(error);
  }
});

app.put('/api/teachers/:id', async (req, res, next) => {
  try {
    // Update teacher fields
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

    // If password provided, update linked user
    if (req.body.password) {
      if (teacher.userId) {
        const hashed = await bcrypt.hash(req.body.password, 10);
        await prisma.user.update({ where: { id: teacher.userId }, data: { password: hashed } });
      }
    }

    res.json({ success: true, data: mapTeacher(teacher) });
  } catch (error) {
    next(error);
  }
});

// Reset teacher password (admin)
app.post('/api/teachers/:id/reset-password', async (req, res, next) => {
  try {
    const teacher = await prisma.teacher.findUnique({ where: { id: req.params.id } });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    const plain = generateRandomPassword(10);
    const hashed = await bcrypt.hash(plain, 10);

    if (teacher.userId) {
      await prisma.user.update({ where: { id: teacher.userId }, data: { password: hashed } });
    } else {
      const user = await prisma.user.create({ data: { email: teacher.email, password: hashed, name: teacher.name, role: 'INSTRUCTOR' } });
      await prisma.teacher.update({ where: { id: teacher.id }, data: { userId: user.id } });
    }

    res.json({ success: true, data: { generatedPassword: plain } });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/teachers/:id', async (req, res, next) => {
  try {
    await prisma.teacher.update({
      where: { id: req.params.id },
      data: { status: 'INACTIVO' },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.get('/api/students', async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 50);
    const total = await prisma.student.count();
    const students = await prisma.student.findMany({
      orderBy: { joinedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    const mapped = await Promise.all(students.map(mapStudent));
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    res.json({ success: true, data: { data: mapped, total, page, pageSize, totalPages } });
  } catch (error) {
    next(error);
  }
});

app.post('/api/students', async (req, res, next) => {
  try {
    const groupName = req.body.group ?? '';
    const program = req.body.program ?? (await getProgramForGroup(groupName));
    // Prevent duplicate user by email
    const existing = await prisma.user.findUnique({ where: { email: req.body.email } });
    if (existing) return res.status(400).json({ success: false, message: 'Ya existe un usuario con ese correo' });

    const plain = req.body.password ?? generateRandomPassword(8);
    const hashed = await bcrypt.hash(plain, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: { email: req.body.email, password: hashed, name: req.body.name, role: 'STUDENT' } });
      const student = await tx.student.create({
        data: {
          userId: user.id,
          name: req.body.name,
          email: req.body.email,
          phone: req.body.phone ?? '',
          program,
          group: groupName,
          status: (req.body.status ?? 'Pendiente').toUpperCase(),
          active: req.body.active ?? true,
          teacherId: req.body.teacherId ?? undefined,
        },
      });
      return { user, student };
    });

    res.status(201).json({ success: true, data: { ...(await mapStudent(result.student)), generatedPassword: plain } });
  } catch (error) {
    next(error);
  }
});

app.put('/api/students/:id', async (req, res, next) => {
  try {
    const groupName = req.body.group;
    const program = req.body.program ?? (groupName ? await getProgramForGroup(groupName) : undefined);
    const student = await prisma.student.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        program,
        group: groupName,
        status: req.body.status ? String(req.body.status).toUpperCase() : undefined,
        active: req.body.active,
        teacherId: req.body.teacherId,
      },
    });

    // If password provided, update linked user
    if (req.body.password) {
      if (student.userId) {
        const hashed = await bcrypt.hash(req.body.password, 10);
        await prisma.user.update({ where: { id: student.userId }, data: { password: hashed } });
      }
    }

    res.json({ success: true, data: await mapStudent(student) });
  } catch (error) {
    next(error);
  }
});

// Reset student password (admin) -> generate new password, update User, return generatedPassword
app.post('/api/students/:id/reset-password', async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const plain = generateRandomPassword(10);
    const hashed = await bcrypt.hash(plain, 10);

    if (student.userId) {
      await prisma.user.update({ where: { id: student.userId }, data: { password: hashed } });
    } else {
      // create user and link
      const user = await prisma.user.create({ data: { email: student.email, password: hashed, name: student.name, role: 'STUDENT' } });
      await prisma.student.update({ where: { id: student.id }, data: { userId: user.id } });
    }

    res.json({ success: true, data: { generatedPassword: plain } });
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

app.get('/api/modules', async (req, res, next) => {
  try {
    const teacherId = req.query.teacherId as string | undefined;
    const modules = await prisma.module.findMany({ orderBy: { createdAt: 'desc' } });
    let mapped = await Promise.all(modules.map(mapModule));

    if (teacherId) {
      mapped = mapped.filter((m) => String(m.assignedTeacherId ?? '') === String(teacherId));
    }

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
    const course = req.query.course as string | undefined;
    const group = req.query.group as string | undefined;
    const program = req.query.program as string | undefined;
    const moduleId = req.query.moduleId as string | undefined;

    let activities = await prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Enrich activities: if `course` is missing but `moduleId` exists,
    // resolve the module -> course name so frontend can match by course/group/program.
    const moduleIds = Array.from(new Set(activities.map((a) => a.moduleId).filter(Boolean) as string[]));
    let modulesMap: Record<string, { id: string; courseName?: string }> = {};
    if (moduleIds.length > 0) {
      const modules = await prisma.module.findMany({
        where: { id: { in: moduleIds } },
        select: { id: true, courseId: true },
      });
      const courseIds = Array.from(new Set(modules.map((m) => m.courseId).filter(Boolean) as string[]));
      const courses = courseIds.length > 0 ? await prisma.course.findMany({ where: { id: { in: courseIds } }, select: { id: true, name: true } }) : [];
      const courseMap = Object.fromEntries(courses.map((c) => [c.id, c.name]));
      modulesMap = Object.fromEntries(modules.map((m) => [m.id, { id: m.id, courseName: m.courseId ? courseMap[m.courseId] : '' }]));
      // apply enrichment
      activities = activities.map((a) => ({
        ...a,
        course: a.course || (a.moduleId ? modulesMap[a.moduleId]?.courseName ?? '' : a.course),
      }));
    }

    const resolveAllowedCourseNames = async (groupName?: string, programName?: string): Promise<string[]> => {
      if (!groupName && !programName) return [];

      const normalizedGroupName = groupName?.trim().toLowerCase() ?? '';
      const normalizedProgramName = programName?.trim().toLowerCase() ?? '';
      const centerName = normalizedGroupName.split(' - ')[0]?.trim() ?? '';

      const courses = await prisma.course.findMany({ select: { name: true, groups: true } });
      return Array.from(
        new Set(
          courses
            .filter((course) => {
              const title = String(course.name ?? '').toLowerCase();
              const groupsString = String(course.groups ?? '').toLowerCase();

              const groupMatch = normalizedGroupName.length > 0 && groupsString.includes(normalizedGroupName);
              const programMatch = normalizedProgramName.length > 0 && title.includes(normalizedProgramName);
              const centerMatch = centerName.length > 0 && title.includes(centerName);

              if (normalizedGroupName && normalizedProgramName) {
                return (groupMatch || (programMatch && centerMatch));
              }
              if (normalizedGroupName) {
                return groupMatch || centerMatch;
              }
              return programMatch;
            })
            .map((course) => String(course.name)),
        ),
      );
    };

    const allowedCourseNames = await resolveAllowedCourseNames(group, program);

    const matchesContext = (activity: (typeof activities)[number]) => {
      if (studentId && activity.studentId) {
        return activity.studentId === studentId;
      }

      if (moduleId && activity.moduleId && activity.moduleId !== moduleId) {
        return false;
      }
      if (course && activity.course && activity.course !== course) {
        return false;
      }

      if (course && activity.course === course) {
        return true;
      }
      if (moduleId && activity.moduleId === moduleId) {
        return true;
      }
      if (group || program) {
        return Boolean(activity.course) && allowedCourseNames.includes(activity.course);
      }

      if (studentId && !activity.studentId) {
        return false;
      }

      return true;
    };

    if (teacherId) {
      activities = activities.filter((a) => a.teacherId === teacherId);
    }
    if (studentId || course || group || program || moduleId) {
      activities = activities.filter(matchesContext);
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
        studentSubmissionStatus: a.studentSubmissionStatus,
        studentSubmissionText: a.studentSubmissionText,
        studentSubmissionAttachmentUrl: a.studentSubmissionAttachmentUrl,
        studentSubmissionAttachmentName: a.studentSubmissionAttachmentName,
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
    // Derive teacherId from module -> course -> group.programs mentor (preferred over manual assignment)
    let teacherIdToUse: string | undefined = undefined;
    if (req.body.moduleId) {
      try {
        const mod = await prisma.module.findUnique({ where: { id: String(req.body.moduleId) }, select: { id: true, courseId: true } });
        if (mod?.courseId) {
          const course = await prisma.course.findUnique({ where: { id: mod.courseId }, select: { id: true, name: true } });
          const courseName = String(course?.name ?? '');
          const parts = courseName.split(' - ');
          const centerPart = parts[0]?.trim().toLowerCase() ?? '';
          const programPart = parts[1]?.trim().toLowerCase() ?? '';

          // load groups and inspect their programs JSON to find a mentor for this program + center
          const allGroups = await prisma.group.findMany({ select: { id: true, name: true, programs: true, centerId: true } });
          for (const g of allGroups) {
            const gName = String(g.name ?? '').toLowerCase();
            // quick center match: course name first part should match group's name first part
            if (centerPart && !gName.includes(centerPart)) continue;
            const programs = Array.isArray(g.programs) ? g.programs : [];
            for (const p of programs) {
              const prog = String(p?.program ?? '').toLowerCase();
              const mentor = String(p?.mentor ?? '').trim();
              if (prog && programPart && prog === programPart && mentor) {
                const teacher = await prisma.teacher.findFirst({ where: { name: mentor } });
                if (teacher) {
                  teacherIdToUse = teacher.id;
                  break;
                }
              }
            }
            if (teacherIdToUse) break;
          }
        }
      } catch (err) {
        // if resolution fails, continue and allow null teacherId
        console.error('Failed to resolve teacher for activity:', err);
      }
    }

    // If derivation failed, fall back to provided teacherId (if any)
    if (!teacherIdToUse && req.body.teacherId) {
      teacherIdToUse = req.body.teacherId;
    }

    const activityCount = await prisma.activity.count({
      where: req.body.moduleId ? { moduleId: String(req.body.moduleId) } : {},
    });
    const titleToUse = sanitizeActivityTitle(req.body.title, activityCount + 1);

    const activity = await prisma.activity.create({
      data: {
        title: titleToUse,
        description: req.body.description,
        moduleId: req.body.moduleId,
        course: req.body.course,
        studentId: req.body.studentId,
        teacherId: teacherIdToUse ?? undefined,
        lesson: req.body.lesson,
        status: req.body.status,
        progress: req.body.progress,
        attachmentUrl: req.body.attachmentUrl,
        attachmentName: req.body.attachmentName,
        studentSubmissionStatus: req.body.studentSubmissionStatus,
        studentSubmissionText: req.body.studentSubmissionText,
        studentSubmissionAttachmentUrl: req.body.studentSubmissionAttachmentUrl,
        studentSubmissionAttachmentName: req.body.studentSubmissionAttachmentName,
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
        studentSubmissionStatus: activity.studentSubmissionStatus,
        studentSubmissionText: activity.studentSubmissionText,
        studentSubmissionAttachmentUrl: activity.studentSubmissionAttachmentUrl,
        studentSubmissionAttachmentName: activity.studentSubmissionAttachmentName,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.put('/api/activities/:id/submission', async (req, res, next) => {
  try {
    const updateData: Record<string, unknown> = {};
    const submissionFields = [
      'studentSubmissionStatus',
      'studentSubmissionText',
      'studentSubmissionAttachmentUrl',
      'studentSubmissionAttachmentName',
    ] as const;

    submissionFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updateData[field] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ success: false, message: 'No se proporcionaron campos de envío válidos.' });
      return;
    }

    const activity = await prisma.activity.update({
      where: { id: req.params.id },
      data: updateData,
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
        studentSubmissionStatus: activity.studentSubmissionStatus,
        studentSubmissionText: activity.studentSubmissionText,
        studentSubmissionAttachmentUrl: activity.studentSubmissionAttachmentUrl,
        studentSubmissionAttachmentName: activity.studentSubmissionAttachmentName,
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
    const updateData: Record<string, unknown> = {};
    const updatableFields = [
      'title',
      'description',
      'lesson',
      'moduleId',
      'course',
      'studentId',
      'status',
      'progress',
      'attachmentUrl',
      'attachmentName',
      'studentSubmissionStatus',
      'studentSubmissionText',
      'studentSubmissionAttachmentUrl',
      'studentSubmissionAttachmentName',
    ] as const;

    updatableFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updateData[field] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ success: false, message: 'No se proporcionaron campos actualizables válidos.' });
      return;
    }

    const activity = await prisma.activity.update({
      where: { id: req.params.id },
      data: updateData,
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
        studentSubmissionStatus: activity.studentSubmissionStatus,
        studentSubmissionText: activity.studentSubmissionText,
        studentSubmissionAttachmentUrl: activity.studentSubmissionAttachmentUrl,
        studentSubmissionAttachmentName: activity.studentSubmissionAttachmentName,
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

// Admin endpoint to sanitize all activity titles and descriptions (remove teacher names)
app.post('/api/admin/sanitize-activities', async (req, res, next) => {
  try {
    const allActivities = await prisma.activity.findMany({});
    let totalUpdated = 0;

    for (let i = 0; i < allActivities.length; i++) {
      const act = allActivities[i];
      const sanitizedTitle = sanitizeActivityTitle(act.title, i + 1);
      const sanitizedDesc = String(act.description ?? '')
        .replace(/^(docente asignado al|asignación docente:?|asignaci\u00f3n docente:?)/gi, '')
        .trim();

      if (sanitizedTitle !== act.title || sanitizedDesc !== act.description) {
        await prisma.activity.update({
          where: { id: act.id },
          data: {
            title: sanitizedTitle,
            description: sanitizedDesc,
          },
        });
        totalUpdated++;
      }
    }

    res.json({
      success: true,
      data: {
        totalProcessed: allActivities.length,
        totalUpdated,
        message: `${totalUpdated} actividades fueron sanitizadas`,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

const seedDatabase = async () => {
  const userCount = await prisma.user.count();
  if (userCount > 0) return;

  const hash = await import('bcrypt').then((m) => m.default.hash('123456', 10));

  const admin = await prisma.user.create({
    data: {
      email: 'admin@workflow.academy',
      password: hash,
      name: 'Administrador',
      role: 'ADMIN',
    },
  });

  const instructorUser = await prisma.user.create({
    data: {
      email: 'docente@workflow.academy',
      password: hash,
      name: 'Docente Demo',
      role: 'INSTRUCTOR',
    },
  });

  const studentUser = await prisma.user.create({
    data: {
      email: 'estudiante@workflow.academy',
      password: hash,
      name: 'Estudiante Demo',
      role: 'STUDENT',
    },
  });

  const center = await prisma.center.create({
    data: {
      name: 'Workflow Academy Centro Principal',
      website: 'https://workflow.academy',
      plan: 'Premium',
      active: true,
    },
  });

  const group = await prisma.group.create({
    data: {
      name: 'Cohorte Fitness 2026',
      centerId: center.id,
      status: 'INSCRIPCIONES',
      active: true,
      programs: [
        { program: 'Entrenamiento Funcional', mentor: 'Docente Demo' },
        { program: 'Nutrición Deportiva', mentor: 'Ana Gómez' },
      ],
    },
  });

  const teacher = await prisma.teacher.create({
    data: {
      userId: instructorUser.id,
      name: 'Docente Demo',
      email: 'docente@workflow.academy',
      phone: '+57 300 555 0101',
      city: 'Medellín',
      specialties: 'Nutrición Deportiva,Entrenamiento Funcional',
      status: 'ACTIVO',
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

  const module = await prisma.module.create({
    data: {
      title: 'Fundamentos del Movimiento',
      courseId: course.id,
      lessons: 4,
      duration: '4h 30m',
      status: 'ACTIVO',
      progress: 100,
    },
  });

  await prisma.module.create({
    data: {
      title: 'Hipertrofia y Fuerza',
      courseId: course.id,
      lessons: 5,
      duration: '5h 20m',
      status: 'ACTIVO',
      progress: 78,
    },
  });

  await prisma.student.createMany({
    data: Array.from({ length: 101 }, (_, index) => ({
      name: `Estudiante ${index + 1}`,
      email: `estudiante${index + 1}@workflow.academy`,
      phone: `+57 300 000 ${String(index + 1).padStart(4, '0')}`,
      program: 'Entrenamiento Funcional',
      group: 'Cohorte Fitness 2026',
      status: index % 10 === 0 ? 'INACTIVO' : 'ACTIVO',
      active: index % 10 !== 0,
      teacherId: teacher.id,
      userId: index === 0 ? studentUser.id : undefined,
    })),
  });

  await prisma.activity.createMany({
    data: [
      {
        title: 'Rutina inicial',
        description: 'Actividad de bienvenida',
        moduleId: module.id,
        course: course.name,
        studentId: undefined,
        teacherId: teacher.id,
        lesson: '1',
        status: 'PENDIENTE',
        progress: 0,
      },
    ],
  });

  logger.info(`Seeded demo data for admin ${admin.email}, teacher ${teacher.email}, group ${group.name}`);
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


