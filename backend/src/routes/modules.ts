import { Router } from 'express';
import { prisma } from '../config/database';

const toApiResponse = (data: unknown) => ({ success: true, data });
const normalizeStatus = (value?: string | null): string => {
  const upper = (value ?? '').toUpperCase();
  if (upper === 'ACTIVO' || upper === 'ACTIVE') return 'Activo';
  if (upper === 'INACTIVO' || upper === 'INACTIVE') return 'Inactivo';
  return value ?? 'Activo';
};
const mapModule = async (module: any) => {
  const course = await prisma.course.findUnique({ where: { id: module.courseId } });
  // derive assigned teacher for this module based on course name -> center/program -> group.programs mentor
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
    // ignore errors and return null teacher
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

export const createModulesRouter = () => {
  const router = Router();

  router.get(/^\/$/, async (_req, res, next) => {
    try {
      const modules = await prisma.module.findMany({ orderBy: { createdAt: 'desc' } });
      const mapped = await Promise.all(modules.map(mapModule));
      res.json(toApiResponse(mapped));
    } catch (error) {
      next(error);
    }
  });

  router.post(/^\/$/, async (req, res, next) => {
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

  router.put('/:id', async (req, res, next) => {
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

  router.delete('/:id', async (req, res, next) => {
    try {
      await prisma.module.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
};
