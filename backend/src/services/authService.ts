import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { JwtPayload } from '../types';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

export async function register(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError('Пользователь с таким email уже существует', 409);

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { ...data, password: hashedPassword },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
  });

  return user;
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError('Неверный email или пароль', 401);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError('Неверный email или пароль', 401);

  const payload: JwtPayload = { userId: user.id, role: user.role, email: user.email };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  } as jwt.SignOptions);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt },
  });

  const { password: _, ...userWithoutPassword } = user;

  return { accessToken, refreshToken, user: userWithoutPassword };
}

export async function refresh(refreshToken: string) {
  let payload: JwtPayload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
  } catch {
    throw new AppError('Недействительный refresh токен', 401);
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError('Refresh токен устарел или не найден', 401);
  }

  await prisma.refreshToken.delete({ where: { token: refreshToken } });

  const newPayload: JwtPayload = { userId: payload.userId, role: payload.role, email: payload.email };

  const accessToken = jwt.sign(newPayload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  } as jwt.SignOptions);

  const newRefreshToken = jwt.sign(newPayload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  } as jwt.SignOptions);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: { token: newRefreshToken, userId: payload.userId, expiresAt },
  });

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logout(refreshToken: string) {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}

export async function getUsers(role?: Role) {
  return prisma.user.findMany({
    where: role ? { role } : undefined,
    select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
    orderBy: { firstName: 'asc' },
  });
}
