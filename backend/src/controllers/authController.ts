import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';
import * as authService from '../services/authService';
import { AuthRequest } from '../types';

const registerSchema = z.object({
  email: z.string().email('Неверный формат email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  firstName: z.string().min(1, 'Имя обязательно'),
  lastName: z.string().min(1, 'Фамилия обязательна'),
  role: z.nativeEnum(Role),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const data = registerSchema.parse(req.body);
    const user = await authService.register(data);
    res.status(201).json({ data: user, message: 'Пользователь успешно зарегистрирован' });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await authService.login(email, password);
    res.json({ data: result, message: 'Вход выполнен успешно' });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh токен обязателен' });
      return;
    }
    const tokens = await authService.refresh(refreshToken);
    res.json({ data: tokens, message: 'Токен обновлён' });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await authService.logout(refreshToken);
    res.json({ message: 'Выход выполнен успешно' });
  } catch (err) {
    next(err);
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const users = await authService.getUsers();
    const user = users.find((u) => u.id === req.user!.userId);
    if (!user) {
      res.status(404).json({ error: 'Пользователь не найден' });
      return;
    }
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}

export async function getUsers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const role = req.query.role as Role | undefined;
    const users = await authService.getUsers(role);
    res.json({ data: users });
  } catch (err) {
    next(err);
  }
}
