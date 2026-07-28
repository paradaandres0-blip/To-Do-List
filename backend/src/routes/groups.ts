import { Router } from 'express';
import { prisma } from '../config/database';

const toApiResponse = (data: unknown) => ({ success: true, data });

export const createGroupsRouter = () => {
  const router = Router();

  router.get('/', async (_req, res, next) => {
    try {
      const groups = await prisma.group.findMany({ orderBy: { createdAt: 'desc' } });
      res.json(toApiResponse(groups));
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const group = await prisma.group.findUnique({ where: { id: req.params.id } });
      if (!group) {
        return res.status(404).json({ success: false, message: 'Grupo no encontrado' });
      }
      res.json(toApiResponse(group));
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const group = await prisma.group.create({
        data: {
          name: req.body.name,
          centerId: req.body.centerId,
          status: req.body.status ?? 'Inscripciones',
          active: req.body.active ?? true,
          programs: Array.isArray(req.body.programs) ? req.body.programs : [],
        },
      });
      res.status(201).json(toApiResponse(group));
    } catch (error) {
      next(error);
    }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const group = await prisma.group.update({
        where: { id: req.params.id },
        data: {
          name: req.body.name,
          centerId: req.body.centerId,
          status: req.body.status,
          active: req.body.active,
          programs: Array.isArray(req.body.programs) ? req.body.programs : undefined,
        },
      });
      res.json(toApiResponse(group));
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      await prisma.group.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
};
