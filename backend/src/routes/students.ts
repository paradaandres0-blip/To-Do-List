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

export const createStudentsRouter = () => {
  const router = Router();

  router.get(/^\/$/, async (_req, res, next) => {
    try {
      const students = await prisma.student.findMany({ orderBy: { joinedAt: 'desc' } });
      res.json(toApiResponse(students.map(mapStudent)));
    } catch (error) {
      next(error);
    }
  });

  router.post(/^\/$/, async (req, res, next) => {
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

  router.put('/:id', async (req, res, next) => {
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

  router.delete('/:id', async (req, res, next) => {
    try {
      await prisma.student.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
};
