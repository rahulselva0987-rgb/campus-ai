import { Router, Response } from 'express';
import { prisma } from '../prismaClient';
import { authenticate, AuthRequest } from '../middleware/auth';
import { ALL_SKILLS, generateRecommendations } from '../services/skillService';

export const recommendationsRouter = Router();
recommendationsRouter.use(authenticate);

recommendationsRouter.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: req.user!.id },
    include: { studentSkills: { include: { skill: true } }, recommendations: true }
  });
  if (!profile) { res.status(404).json({ error: 'Profile not found' }); return; }

  const haveSkills = profile.studentSkills.map(ss => ss.skill.name);
  const missingSkills = ALL_SKILLS.filter(s => !haveSkills.includes(s));

  // Generate fresh recommendations if none exist or refresh
  if (profile.recommendations.length === 0) {
    const recs = generateRecommendations(missingSkills, profile.careerGoal);
    const created = await Promise.all(recs.map(r => prisma.recommendation.create({ data: { ...r, studentId: profile.id } })));
    res.json(created);
  } else {
    res.json(profile.recommendations);
  }
});