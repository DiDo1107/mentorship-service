import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { PairStatus } from '@prisma/client';
import { AuthRequest } from '../types';
import * as pairsService from '../services/pairsService';

const createSchema = z.object({
  mentorId: z.string().min(1),
  employeeId: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export async function createPair(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createSchema.parse(req.body);
    const pair = await pairsService.createPair({
      ...data,
      hrId: req.user!.userId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    });
    res.status(201).json({ data: pair, message: 'Пара наставничества создана' });
  } catch (err) {
    next(err);
  }
}

export async function getPairs(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { role, userId } = req.user!;
    let data;

    if (role === 'hr') {
      const status = req.query.status as PairStatus | undefined;
      data = await pairsService.getAllPairs(status ? { status } : undefined);
    } else if (role === 'mentor') {
      data = await pairsService.getPairsByMentor(userId);
    } else {
      data = await pairsService.getPairByEmployee(userId);
      data = data ? [data] : [];
    }

    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function getPairById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const pair = await pairsService.getPairById(req.params.id);
    res.json({ data: pair });
  } catch (err) {
    next(err);
  }
}

export async function updatePairStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { status } = z.object({ status: z.nativeEnum(PairStatus) }).parse(req.body);
    const pair = await pairsService.updatePairStatus(req.params.id, status);
    res.json({ data: pair, message: 'Статус пары обновлён' });
  } catch (err) {
    next(err);
  }
}
