import { Router } from 'express';
import { prisma } from '../config/database';

const toApiResponse = (data: unknown) => ({ success: true, data });

export const createGroupsRouter = () => {
  const router = Router();

  // Helper: propagate mentor assignments from group.programs to activities
  // Returns number of activities updated for this group
  const propagateMentorAssignments = async (group: any): Promise<number> => {
    let totalUpdated = 0;
    try {
      const center = group.centerId ? await prisma.center.findUnique({ where: { id: group.centerId } }) : null;
      const centerName = String(center?.name ?? '').trim().toLowerCase();

      const programs = Array.isArray(group.programs) ? group.programs : [];
      if (programs.length === 0) return 0;

      // load all courses once
      const allCourses = await prisma.course.findMany({ select: { id: true, name: true } });

      for (const p of programs) {
        const programName = String(p?.program ?? '').trim().toLowerCase();
        const mentorName = String(p?.mentor ?? '').trim();
        if (!programName || !mentorName) continue;

        const teacher = await prisma.teacher.findFirst({ where: { name: mentorName } });
        if (!teacher) continue;

        // find matching courses by center and program
        const matchingCourseIds: string[] = [];
        for (const c of allCourses) {
          const parts = String(c.name ?? '').split(' - ');
          const cCenter = parts[0]?.trim().toLowerCase() ?? '';
          const cProgram = parts[1]?.trim().toLowerCase() ?? '';
          if (programName && cProgram === programName && (!centerName || cCenter === centerName)) {
            matchingCourseIds.push(c.id);
          }
        }

        if (matchingCourseIds.length === 0) continue;

        // modules for these courses
        const modules = await prisma.module.findMany({ where: { courseId: { in: matchingCourseIds } }, select: { id: true } });
        const moduleIds = modules.map((m) => m.id);
        if (moduleIds.length === 0) continue;

        // update activities under these modules to set teacherId = teacher.id
        const update = await prisma.activity.updateMany({ where: { moduleId: { in: moduleIds } }, data: { teacherId: teacher.id } });
        totalUpdated += update.count ?? 0;
      }
    } catch (err) {
      console.error('Error propagating mentor assignments for group', group.id, err);
    }
    return totalUpdated;
  };

  router.get('/', async (req, res, next) => {
    try {
      const teacherId = req.query.teacherId as string | undefined;
      let groups = await prisma.group.findMany({ orderBy: { createdAt: 'desc' } });

      if (teacherId) {
        const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
        const teacherName = String(teacher?.name ?? '').trim().toLowerCase();
        if (teacherName) {
          groups = groups.filter((g) => {
            const programs = Array.isArray(g.programs) ? g.programs : [];
            return programs.some((p: any) => String(p?.mentor ?? '').trim().toLowerCase() === teacherName);
          });
        } else {
          groups = [];
        }
      }

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
      // propagate mentor assignments to activities for the newly created group
      await propagateMentorAssignments(group);
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
      // propagate mentor assignments when group programs are updated
      await propagateMentorAssignments(group);
      res.json(toApiResponse(group));
    } catch (error) {
      next(error);
    }
  });

  // Admin endpoint: run normalization for all groups and return summary
  router.post('/sync-mentors', async (_req, res, next) => {
    try {
      const groups = await prisma.group.findMany({ select: { id: true, name: true, centerId: true, programs: true } });
      let total = 0;
      const details: Array<{ groupId: string; updated: number }> = [];
      for (const g of groups) {
        const updated = await propagateMentorAssignments(g);
        details.push({ groupId: g.id, updated });
        total += updated;
      }
      res.json(toApiResponse({ totalUpdated: total, details }));
    } catch (err) {
      next(err);
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
