import { Router, Response } from 'express';
import { prisma } from '../prismaClient';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

export const adminRouter = Router();
adminRouter.use(authenticate, requireAdmin);

adminRouter.get('/statistics', async (_req, res: Response): Promise<void> => {
  const [totalStudents, totalCerts, pendingCerts, verifiedCerts, totalActivities] = await Promise.all([
    prisma.studentProfile.count(),
    prisma.certificate.count(),
    prisma.certificate.count({ where: { status: 'pending' } }),
    prisma.certificate.count({ where: { status: 'verified' } }),
    prisma.activity.count(),
  ]);
  res.json({ totalStudents, totalCerts, pendingCerts, verifiedCerts, totalActivities });
});

adminRouter.get('/students', async (_req, res: Response): Promise<void> => {
  const students = await prisma.studentProfile.findMany({
    include: {
      user: { select: { email: true, createdAt: true } },
      _count: { select: { activities: true, certificates: true } }
    }
  });
  res.json(students);
});

adminRouter.get('/certificates', async (_req, res: Response): Promise<void> => {
  const certs = await prisma.certificate.findMany({
    include: { student: { select: { fullName: true, department: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(certs);
});