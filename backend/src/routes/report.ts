import { Router, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleGuard } from '../middleware/roleGuard';
import { AuthRequest } from '../types/index';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

router.get('/pair/:pairId', roleGuard('hr'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const pair = await prisma.mentorPair.findUnique({
      where: { id: req.params.pairId },
      include: {
        mentor: { select: { firstName: true, lastName: true, email: true } },
        employee: { select: { firstName: true, lastName: true, email: true } },
        tasks: { orderBy: { deadline: 'asc' } },
        meetings: { orderBy: { scheduledAt: 'asc' } },
        feedback: {
          include: {
            giver: { select: { firstName: true, lastName: true, role: true } },
          },
        },
      },
    });

    if (!pair) throw new AppError('Пара не найдена', 404);

    res.json({ data: pair });
  } catch (err) {
    next(err);
  }
});

export default router;
