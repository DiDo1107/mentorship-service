import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types';
import * as feedbackService from '../services/feedbackService';

const createSchema = z.object({
  pairId: z.string().min(1),
  receiverId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

const updateSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().optional(),
});

export async function createFeedback(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createSchema.parse(req.body);
    const feedback = await feedbackService.createFeedback({
      ...data,
      giverId: req.user!.userId,
    });
    res.status(201).json({ data: feedback, message: 'Обратная связь оставлена' });
  } catch (err) {
    next(err);
  }
}

export async function getFeedbackByPair(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const feedback = await feedbackService.getFeedbackByPair(req.params.pairId);
    res.json({ data: feedback });
  } catch (err) {
    next(err);
  }
}

export async function updateFeedback(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = updateSchema.parse(req.body);
    const feedback = await feedbackService.updateFeedback(req.params.id, data, req.user!.userId);
    res.json({ data: feedback, message: 'Обратная связь обновлена' });
  } catch (err) {
    next(err);
  }
}
