import { Router, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { AuthRequest } from '../types/index';
import * as notificationsService from '../services/notificationsService';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notifications = await notificationsService.getNotifications(req.user!.userId);
    res.json({ data: notifications });
  } catch (err) {
    next(err);
  }
});

router.get('/unread-count', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const count = await notificationsService.getUnreadCount(req.user!.userId);
    res.json({ data: count });
  } catch (err) {
    next(err);
  }
});

router.post('/mark-read', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await notificationsService.markAllRead(req.user!.userId);
    res.json({ message: 'Уведомления прочитаны' });
  } catch (err) {
    next(err);
  }
});

export default router;
