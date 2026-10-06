import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../prismaClient';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(1),
  role: z.enum(['student', 'admin']).default('student'),
  department: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: 'Validation failed', details: parse.error.flatten() }); return; }

  const { email, password, fullName, role, department } = parse.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) { res.status(409).json({ error: 'Email already registered' }); return; }

  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { email, password: hash, role } });

  if (role === 'student') {
    await prisma.studentProfile.create({
      data: { userId: user.id, fullName, department: department || 'Computer Science' }
    });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
  res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role, fullName } });
});

authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: 'Validation failed' }); return; }

  const { email, password } = parse.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) { res.status(401).json({ error: 'Invalid credentials' }); return; }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) { res.status(401).json({ error: 'Invalid credentials' }); return; }

  let fullName = '';
  if (user.role === 'student') {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
    fullName = profile?.fullName || '';
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, fullName } });
});