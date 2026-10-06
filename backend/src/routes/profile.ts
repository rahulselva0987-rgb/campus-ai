import { Router, Response } from 'express';
import { prisma } from '../prismaClient';
import { authenticate, AuthRequest } from '../middleware/auth';

export const profileRouter = Router();
profileRouter.use(authenticate);

profileRouter.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  if (user.role === 'student') {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
      include: {
        activities: { orderBy: { createdAt: 'desc' }, take: 5 },
        certificates: { orderBy: { createdAt: 'desc' }, take: 5 },
        studentSkills: { include: { skill: true } },
      }
    });
    res.json({ user: { id: user.id, email: user.email, role: user.role }, profile });
  } else {
    res.json({ user: { id: user.id, email: user.email, role: user.role }, profile: null });
  }
});

profileRouter.put('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { fullName, department, year, bio, careerGoal } = req.body;
  const updated = await prisma.studentProfile.update({
    where: { userId: req.user!.id },
    data: { fullName, department, year: year ? Number(year) : undefined, bio, careerGoal }
  });
  res.json(updated);
});