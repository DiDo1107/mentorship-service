import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/authMiddleware';
import { AuthRequest } from '../types/index';
import * as commentsService from '../services/commentsService';

const router = Router();

router.use(authMiddleware);

const createSchema = z.object({
  taskId: z.string().min(1),
  text: z.string().min(1, 'Текст комментария обязателен'),
});

router.get('/task/:taskId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const comments = await commentsService.getCommentsByTask(
      req.params.taskId,
      req.user!.userId,
    );
    res.json({ data: comments });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { taskId, text } = createSchema.parse(req.body);
    const comment = await commentsService.createComment({
      taskId,
      authorId: req.user!.userId,
      text,
    });
    res.status(201).json({ data: comment, message: 'Комментарий добавлен' });
  } catch (err) {
    next(err);
  }
});

export default router;
