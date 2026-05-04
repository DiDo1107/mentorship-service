import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types';
import * as meetingsService from '../services/meetingsService';

const createSchema = z.object({
  pairId: z.string().min(1),
  scheduledAt: z.string().datetime(),
  notes: z.string().optional(),
});

const updateSchema = z.object({
  scheduledAt: z.string().datetime().optional(),
  notes: z.string().optional(),
  summary: z.string().optional(),
});

export async function createMeeting(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createSchema.parse(req.body);
    const meeting = await meetingsService.createMeeting({
      ...data,
      creatorId: req.user!.userId,
      scheduledAt: new Date(data.scheduledAt),
    });
    res.status(201).json({ data: meeting, message: 'Встреча запланирована' });
  } catch (err) {
    next(err);
  }
}

export async function getMeetingsByPair(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const meetings = await meetingsService.getMeetingsByPair(req.params.pairId);
    res.json({ data: meetings });
  } catch (err) {
    next(err);
  }
}

export async function updateMeeting(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = updateSchema.parse(req.body);
    const parsed = {
      ...data,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
    };
    const meeting = await meetingsService.updateMeeting(req.params.id, parsed, req.user!.userId);
    res.json({ data: meeting, message: 'Встреча обновлена' });
  } catch (err) {
    next(err);
  }
}

export async function deleteMeeting(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await meetingsService.deleteMeeting(req.params.id, req.user!.userId);
    res.json({ message: 'Встреча удалена' });
  } catch (err) {
    next(err);
  }
}
