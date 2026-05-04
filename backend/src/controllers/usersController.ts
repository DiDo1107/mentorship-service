import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { AuthRequest } from '../types';
import * as usersService from '../services/usersService';

const createSchema = z.object({
  email: z.string().email('Неверный формат email'),
  password: z.string().min(6, 'Минимум 6 символов'),
  firstName: z.string().min(1, 'Имя обязательно'),
  lastName: z.string().min(1, 'Фамилия обязательна'),
  role: z.nativeEnum(Role),
});

const updateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.nativeEnum(Role).optional(),
});

export async function createUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createSchema.parse(req.body);
    const user = await usersService.createUser(data);
    res.status(201).json({ data: user, message: 'Пользователь создан' });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await usersService.deleteUser(req.params.id, req.user!.userId);
    res.json({ message: 'Пользователь удалён' });
  } catch (err) {
    next(err);
  }
}

export async function getAllUsers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const role = req.query.role as Role | undefined;
    const users = await usersService.getAllUsers(role);
    res.json({ data: users });
  } catch (err) {
    next(err);
  }
}

export async function getUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await usersService.getUserById(req.params.id);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = updateSchema.parse(req.body);
    const user = await usersService.updateUser(req.params.id, data);
    res.json({ data: user, message: 'Профиль обновлён' });
  } catch (err) {
    next(err);
  }
}
