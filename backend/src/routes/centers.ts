import { Router } from 'express';
import { prisma } from '../config/database';
import { verifyPassword } from '../services/authService';

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

  router.post('/:id/disable', async (req, res, next) => {
    try {
      const { adminEmail, adminPassword } = req.body;
      if (!adminEmail || !adminPassword) {
        return res.status(400).json({ success: false, message: 'adminEmail y adminPassword son requeridos' });
      }

      const adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });
      if (!adminUser || adminUser.role.toUpperCase() !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Credenciales de administrador inválidas' });
      }

      const isAdminValid = await verifyPassword(adminPassword, adminUser.password);
      if (!isAdminValid) {
        return res.status(403).json({ success: false, message: 'Contraseña de administrador incorrecta' });
      }

      const center = await prisma.center.findUnique({ where: { id: req.params.id } });
      if (!center) {
        return res.status(404).json({ success: false, message: 'Centro no encontrado' });
      }

      const groups = await prisma.group.findMany({ where: { centerId: center.id }, select: { id: true, name: true } });
      const groupNames = groups.map((group) => group.name);

      await prisma.$transaction(async (tx) => {
        await tx.center.update({ where: { id: center.id }, data: { active: false } });
        await tx.group.updateMany({ where: { centerId: center.id }, data: { active: false } });
        if (groupNames.length > 0) {
          await tx.student.updateMany({ where: { group: { in: groupNames } }, data: { active: false } });
          const courses = await tx.course.findMany({ where: { OR: groupNames.map((name) => ({ groups: { contains: name } })) }, select: { id: true } });
          const courseIds = courses.map((course) => course.id);
          if (courseIds.length > 0) {
            await tx.course.updateMany({ where: { id: { in: courseIds } }, data: { status: 'Inactivo' } });
            await tx.module.updateMany({ where: { courseId: { in: courseIds } }, data: { status: 'Inactivo' } });
            const modules = await tx.module.findMany({ where: { courseId: { in: courseIds } }, select: { id: true } });
            const moduleIds = modules.map((module) => module.id);
            await tx.activity.updateMany({ where: { moduleId: { in: moduleIds } }, data: { status: 'Inactivo' } });
          }
        }
      });

      res.json(toApiResponse({ message: 'Centro y recursos asociados desactivados correctamente' }));
    } catch (error) {
      next(error);
    }
  });

  router.post('/:id/enable', async (req, res, next) => {
    try {
      const { adminEmail, adminPassword } = req.body;
      if (!adminEmail || !adminPassword) {
        return res.status(400).json({ success: false, message: 'adminEmail y adminPassword son requeridos' });
      }

      const adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });
      if (!adminUser || adminUser.role.toUpperCase() !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Credenciales de administrador inválidas' });
      }

      const isAdminValid = await verifyPassword(adminPassword, adminUser.password);
      if (!isAdminValid) {
        return res.status(403).json({ success: false, message: 'Contraseña de administrador incorrecta' });
      }

      const center = await prisma.center.findUnique({ where: { id: req.params.id } });
      if (!center) {
        return res.status(404).json({ success: false, message: 'Centro no encontrado' });
      }

      const groups = await prisma.group.findMany({ where: { centerId: center.id }, select: { id: true, name: true } });
      const groupNames = groups.map((group) => group.name);

      await prisma.$transaction(async (tx) => {
        await tx.center.update({ where: { id: center.id }, data: { active: true } });
        await tx.group.updateMany({ where: { centerId: center.id }, data: { active: true } });
        if (groupNames.length > 0) {
          await tx.student.updateMany({ where: { group: { in: groupNames } }, data: { active: true } });
          const courses = await tx.course.findMany({ where: { OR: groupNames.map((name) => ({ groups: { contains: name } })) }, select: { id: true } });
          const courseIds = courses.map((course) => course.id);
          if (courseIds.length > 0) {
            await tx.course.updateMany({ where: { id: { in: courseIds } }, data: { status: 'Activo' } });
            await tx.module.updateMany({ where: { courseId: { in: courseIds } }, data: { status: 'Activo' } });
            const modules = await tx.module.findMany({ where: { courseId: { in: courseIds } }, select: { id: true } });
            const moduleIds = modules.map((module) => module.id);
            await tx.activity.updateMany({ where: { moduleId: { in: moduleIds } }, data: { status: 'Pendiente' } });
          }
        }
      });

      res.json(toApiResponse({ message: 'Centro y recursos asociados reactivados correctamente' }));
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      const { adminEmail, adminPassword } = req.body;
      if (!adminEmail || !adminPassword) {
        return res.status(400).json({ success: false, message: 'adminEmail y adminPassword son requeridos' });
      }

      const adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });
      if (!adminUser || adminUser.role.toUpperCase() !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Credenciales de administrador inválidas' });
      }

      const isAdminValid = await verifyPassword(adminPassword, adminUser.password);
      if (!isAdminValid) {
        return res.status(403).json({ success: false, message: 'Contraseña de administrador incorrecta' });
      }

      const center = await prisma.center.findUnique({ where: { id: req.params.id } });
      if (!center) {
        return res.status(404).json({ success: false, message: 'Centro no encontrado' });
      }

      const groups = await prisma.group.findMany({ where: { centerId: center.id }, select: { name: true } });
      const groupNames = groups.map((group) => group.name);

      await prisma.$transaction(async (tx) => {
        if (groupNames.length > 0) {
          const students = await tx.student.findMany({
            where: { group: { in: groupNames } },
            select: { userId: true },
          });
          const studentUserIds = students.map((student) => student.userId).filter(Boolean) as string[];

          await tx.student.deleteMany({ where: { group: { in: groupNames } } });
          if (studentUserIds.length > 0) {
            await tx.user.deleteMany({ where: { id: { in: studentUserIds } } });
          }
        }

        await tx.center.delete({ where: { id: center.id } });
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
};
