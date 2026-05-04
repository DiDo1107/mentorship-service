import { PrismaClient, TaskPriority, TaskStatus, Role } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { createNotification } from './notificationsService';

const prisma = new PrismaClient();

export async function createTask(data: {
  pairId: string;
  title: string;
  description?: string;
  deadline: Date;
  priority: TaskPriority;
  fileName?: string;
  fileUrl?: string;
}) {
  const pair = await prisma.mentorPair.findUnique({ where: { id: data.pairId } });
  if (!pair) throw new AppError('Пара не найдена', 404);

  const task = await prisma.task.create({ data });

  createNotification({
    userId: pair.employeeId,
    text: `Новая задача: «${data.title}»`,
    link: '/employee/tasks',
  }).catch(() => {});

  return task;
}

export async function getTasksByPair(pairId: string) {
  return prisma.task.findMany({
    where: { pairId },
    orderBy: [{ status: 'asc' }, { deadline: 'asc' }],
  });
}

export async function updateTaskStatus(id: string, status: TaskStatus, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: { pair: true },
  });
  if (!task) throw new AppError('Задача не найдена', 404);

  if (task.pair.employeeId !== userId && task.pair.mentorId !== userId) {
    throw new AppError('Нет доступа к этой задаче', 403);
  }

  return prisma.task.update({ where: { id }, data: { status } });
}

export async function updateTask(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    deadline: Date;
    priority: TaskPriority;
    status: TaskStatus;
  }>,
  userId: string,
  role: Role,
) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: { pair: true },
  });
  if (!task) throw new AppError('Задача не найдена', 404);

  if (task.pair.mentorId !== userId && task.pair.employeeId !== userId) {
    throw new AppError('Нет доступа к этой задаче', 403);
  }

  if (role === Role.employee) {
    if (data.status === TaskStatus.completed) {
      throw new AppError('Только наставник может отмечать задачу как выполненную', 403);
    }
    if (task.status === TaskStatus.completed) {
      throw new AppError('Только наставник может изменять завершённую задачу', 403);
    }
  }

  const updated = await prisma.task.update({ where: { id }, data });

  if (data.status) {
    if (data.status === TaskStatus.in_progress) {
      createNotification({
        userId: task.pair.mentorId,
        text: `Сотрудник взял задачу «${task.title}» в работу`,
        link: '/mentor/dashboard',
      }).catch(() => {});
    } else if (data.status === TaskStatus.completed) {
      createNotification({
        userId: task.pair.employeeId,
        text: `Задача «${task.title}» отмечена как выполненная`,
        link: '/employee/tasks',
      }).catch(() => {});
    }
  }

  return updated;
}

export async function deleteTask(id: string, mentorId: string) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: { pair: true },
  });
  if (!task) throw new AppError('Задача не найдена', 404);
  if (task.pair.mentorId !== mentorId) throw new AppError('Нет доступа', 403);

  return prisma.task.delete({ where: { id } });
}
