import { Router, Response } from 'express';
import { prisma } from '../prismaClient';
import { authenticate, AuthRequest } from '../middleware/auth';
import { ALL_SKILLS, generateRecommendations } from '../services/skillService';

export const skillsRouter = Router();
skillsRouter.use(authenticate);

skillsRouter.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: req.user!.id },
    include: { studentSkills: { include: { skill: true } } }
  });
  if (!profile) { res.status(404).json({ error: 'Profile not found' }); return; }

  const haveSkills = profile.studentSkills.map(ss => ss.skill.name);
  const missingSkills = ALL_SKILLS.filter(s => !haveSkills.includes(s));

  res.json({ skills: profile.studentSkills, allSkills: ALL_SKILLS, missingSkills });
});