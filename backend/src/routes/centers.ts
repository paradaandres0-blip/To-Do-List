import { Router } from 'express';
import { prisma } from '../config/database';

const toApiResponse = (data: unknown) => ({ success: true, data });

export const createCentersRouter = () => {
  const router = Router();

  router.get('/', async (_req, res, next) => {
    try {
      const centers = await prisma.center.findMany({ orderBy: { createdAt: 'desc' } });
      res.json(toApiResponse(centers));
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const center = await prisma.center.findUnique({ where: { id: req.params.id } });
      if (!center) {
        return res.status(404).json({ success: false, message: 'Centro no encontrado' });
      }
      res.json(toApiResponse(center));
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const center = await prisma.center.create({
        data: {
          name: req.body.name,
          website: req.body.website,
          plan: req.body.plan ?? 'Básico',
          active: req.body.active ?? true,
        },
      });
      res.status(201).json(toApiResponse(center));
    } catch (error) {
      next(error);
    }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const center = await prisma.center.update({
        where: { id: req.params.id },
        data: {
          name: req.body.name,
          website: req.body.website,
          plan: req.body.plan,
          active: req.body.active,
        },
      });
      res.json(toApiResponse(center));
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      await prisma.center.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
};
