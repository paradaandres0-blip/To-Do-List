import { Router } from 'express';
import { prisma } from '../config/database';

const toApiResponse = (data: unknown) => ({ success: true, data });
const normalizeStatus = (value?: string | null): string => {
  const upper = (value ?? '').toUpperCase();
  if (upper === 'ACTIVO' || upper === 'ACTIVE') return 'Activo';
  if (upper === 'INACTIVO' || upper === 'INACTIVE') return 'Inactivo';
  return value ?? 'Inactivo';
};
const parseStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
  return [];
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

export const createCoursesRouter = () => {
  const router = Router();

  router.get(/^\/$/, async (_req, res, next) => {
    try {
      const courses = await prisma.course.findMany({ orderBy: { createdAt: 'desc' } });
      const mapped = await Promise.all(courses.map(mapCourse));
      res.json(toApiResponse(mapped));
    } catch (error) {
      next(error);
    }
  });

  router.post(/^\/$/, async (req, res, next) => {
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

  router.put('/:id', async (req, res, next) => {
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

  router.delete('/:id', async (req, res, next) => {
    try {
      await prisma.course.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
};
