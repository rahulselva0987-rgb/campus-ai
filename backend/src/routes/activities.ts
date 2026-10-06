import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prismaClient';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getSkillsForCategory, ALL_SKILLS } from '../services/skillService';

export const activitiesRouter = Router();
activitiesRouter.use(authenticate);

const activitySchema = z.object({
  title: z.string().min(1),
  category: z.enum(['Hackathon','Workshop','Certification','Competition','Internship','Club Activity','Leadership','Community Service']),
  organization: z.string().optional().default(''),
  description: z.string().optional().default(''),
  date: z.string().optional(),
  achievement: z.string().optional().default(''),
});

activitiesRouter.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
  if (!profile) { res.status(404).json({ error: 'Profile not found' }); return; }
  const activities = await prisma.activity.findMany({ where: { studentId: profile.id }, orderBy: { createdAt: 'desc' } });
  res.json(activities);
});

activitiesRouter.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const parse = activitySchema.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: 'Validation failed', details: parse.error.flatten() }); return; }

  const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
  if (!profile) { res.status(404).json({ error: 'Profile not found' }); return; }

  const activity = await prisma.activity.create({
    data: { ...parse.data, studentId: profile.id, date: parse.data.date ? new Date(parse.data.date) : new Date() }
  });

  // Map skills
  const skillNames = getSkillsForCategory(parse.data.category);
  for (const skillName of skillNames) {
    let skill = await prisma.skill.findUnique({ where: { name: skillName } });
    if (!skill) skill = await prisma.skill.create({ data: { name: skillName, category: 'General' } });
    const existing = await prisma.studentSkill.findUnique({ where: { studentId_skillId: { studentId: profile.id, skillId: skill.id } } });
    if (existing) {
      await prisma.studentSkill.update({ where: { id: existing.id }, data: { evidence: existing.evidence + 1, level: Math.min(5, Math.floor((existing.evidence + 1) / 2) + 1) } });
    } else {
      await prisma.studentSkill.create({ data: { studentId: profile.id, skillId: skill.id, level: 1, evidence: 1 } });
    }
  }

  res.status(201).json(activity);
});