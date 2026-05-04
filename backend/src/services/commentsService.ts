import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export async function createComment(data: {
  taskId: string;
  authorId: string;
  text: string;
}) {
  const task = await prisma.task.findUnique({
    where: { id: data.taskId },
    include: { pair: true },
  });
  if (!task) throw new AppError('Задача не найдена', 404);

  const isParticipant =
    task.pair.mentorId === data.authorId || task.pair.employeeId === data.authorId;
  if (!isParticipant) throw new AppError('Нет доступа к этой задаче', 403);

  return prisma.taskComment.create({
    data,
    include: {
      author: { select: { id: true, firstName: true, lastName: true, role: true } },
    },
  });
}

export async function getCommentsByTask(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { pair: true },
  });
  if (!task) throw new AppError('Задача не найдена', 404);

  const isParticipant =
    task.pair.mentorId === userId ||
    task.pair.employeeId === userId ||
    task.pair.hrId === userId;
  if (!isParticipant) throw new AppError('Нет доступа', 403);

  return prisma.taskComment.findMany({
    where: { taskId },
    include: {
      author: { select: { id: true, firstName: true, lastName: true, role: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
}
