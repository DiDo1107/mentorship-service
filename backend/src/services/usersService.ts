import bcrypt from 'bcrypt';
import { PrismaClient, Role } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

const select = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  createdAt: true,
};

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, select });
  if (!user) throw new AppError('Пользователь не найден', 404);
  return user;
}

export async function getAllUsers(role?: Role) {
  return prisma.user.findMany({
    where: role ? { role } : undefined,
    select,
    orderBy: { firstName: 'asc' },
  });
}

export async function createUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError('Пользователь с таким email уже существует', 409);

  const hashedPassword = await bcrypt.hash(data.password, 10);
  return prisma.user.create({ data: { ...data, password: hashedPassword }, select });
}

export async function deleteUser(id: string, requesterId: string) {
  if (id === requesterId) throw new AppError('Нельзя удалить собственный аккаунт', 400);
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError('Пользователь не найден', 404);
  await prisma.user.delete({ where: { id } });
}

export async function updateUser(
  id: string,
  data: { firstName?: string; lastName?: string; email?: string; role?: Role },
) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError('Пользователь не найден', 404);

  if (data.email && data.email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError('Email уже занят', 409);
  }

  return prisma.user.update({ where: { id }, data, select });
}
