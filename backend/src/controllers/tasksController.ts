import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { TaskPriority, TaskStatus } from '@prisma/client';
import { AuthRequest } from '../types';
import * as tasksService from '../services/tasksService';

const createSchema = z.object({
  pairId: z.string().min(1),
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  deadline: z.string().datetime(),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.medium),
  fileName: z.string().optional(),
  fileUrl: z.string().optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  deadline: z.string().datetime().optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
});

export async function createTask(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createSchema.parse(req.body);
    const task = await tasksService.createTask({
      ...data,
      deadline: new Date(data.deadline),
    });
    res.status(201).json({ data: task, message: 'Задача создана' });
  } catch (err) {
    next(err);
  }
}

export async function getTasksByPair(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tasks = await tasksService.getTasksByPair(req.params.pairId);
    res.json({ data: tasks });
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = updateSchema.parse(req.body);
    const parsed: Parameters<typeof tasksService.updateTask>[1] = {
      ...data,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
    };
    const task = await tasksService.updateTask(req.params.id, parsed, req.user!.userId, req.user!.role);
    res.json({ data: task, message: 'Задача обновлена' });
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await tasksService.deleteTask(req.params.id, req.user!.userId);
    res.json({ message: 'Задача удалена' });
  } catch (err) {
    next(err);
  }
}
