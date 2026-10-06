import { Router, Response, Request } from 'express';
import multer from 'multer';
import path from 'path';
import { prisma } from '../prismaClient';
import { authenticate, AuthRequest, requireAdmin } from '../middleware/auth';
import { extractCertificateData, getSkillsForCategory } from '../services/skillService';

export const certificatesRouter = Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../src/uploads'),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

certificatesRouter.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
  if (!profile) { res.status(404).json({ error: 'Profile not found' }); return; }
  const certs = await prisma.certificate.findMany({ where: { studentId: profile.id }, orderBy: { createdAt: 'desc' } });
  res.json(certs);
});

certificatesRouter.post('/', authenticate, upload.single('file'), async (req: AuthRequest, res: Response): Promise<void> => {
  const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
  if (!profile) { res.status(404).json({ error: 'Profile not found' }); return; }

  const { title, organization, issueDate, category, achievement } = req.body;
  const extracted = extractCertificateData(req.file?.originalname || '', title || '');

  const cert = await prisma.certificate.create({
    data: {
      studentId: profile.id,
      title: title || req.file?.originalname || 'Certificate',
      organization: organization || '',
      issueDate: issueDate || '',
      category: category || extracted.extractedCategory,
      achievement: achievement || '',
      status: 'pending',
      fileName: req.file?.originalname || '',
      filePath: req.file?.path || '',
      extractedData: JSON.stringify(extracted),
    }
  });

  // Map skills from certificate category
  const skillNames = getSkillsForCategory(cert.category);
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

  res.status(201).json(cert);
});

certificatesRouter.patch('/:id/status', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { status, reviewNote } = req.body;
  const valid = ['pending', 'verified', 'needs_review', 'rejected'];
  if (!valid.includes(status)) { res.status(400).json({ error: 'Invalid status' }); return; }
  const cert = await prisma.certificate.update({ where: { id: req.params.id }, data: { status, reviewNote: reviewNote || '' } });
  res.json(cert);
});