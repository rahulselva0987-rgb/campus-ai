import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { authRouter } from './routes/auth';
import { profileRouter } from './routes/profile';
import { activitiesRouter } from './routes/activities';
import { certificatesRouter } from './routes/certificates';
import { skillsRouter } from './routes/skills';
import { recommendationsRouter } from './routes/recommendations';
import { adminRouter } from './routes/admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../src/uploads')));

app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/certificates', certificatesRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
}

export default app;