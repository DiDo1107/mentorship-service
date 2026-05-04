import 'dotenv/config';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import pairsRoutes from './routes/pairs';
import tasksRoutes from './routes/tasks';
import meetingsRoutes from './routes/meetings';
import feedbackRoutes from './routes/feedback';
import dashboardRoutes from './routes/dashboard';
import usersRoutes from './routes/users';
import uploadRoutes from './routes/upload';
import notificationsRoutes from './routes/notifications';
import commentsRoutes from './routes/comments';
import reportRoutes from './routes/report';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }),
);

app.use(express.json());

if (!fs.existsSync('/app/uploads')) fs.mkdirSync('/app/uploads', { recursive: true });
app.use('/uploads', express.static('/app/uploads'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/pairs', pairsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/meetings', meetingsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/report', reportRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

export default app;
