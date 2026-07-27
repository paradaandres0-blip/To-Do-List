import { Router } from 'express';
import { prisma } from '../config/database';

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

export const createTeachersRouter = () => {
  const router = Router();

  router.get(/^\/$/, async (_req, res, next) => {
    try {
      const teachers = await prisma.teacher.findMany({ orderBy: { createdAt: 'desc' } });
      res.json(toApiResponse(teachers.map(mapTeacher)));
    } catch (error) {
      next(error);
    }
  });

  router.post(/^\/$/, async (req, res, next) => {
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

  router.put('/:id', async (req, res, next) => {
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

  router.delete('/:id', async (req, res, next) => {
    try {
      await prisma.teacher.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
};
