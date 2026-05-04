import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { createNotification } from './notificationsService';

const prisma = new PrismaClient();

export async function createMeeting(data: {
  pairId: string;
  creatorId: string;
  scheduledAt: Date;
  notes?: string;
}) {
  const pair = await prisma.mentorPair.findUnique({ where: { id: data.pairId } });
  if (!pair) throw new AppError('Пара не найдена', 404);
  if (pair.mentorId !== data.creatorId) throw new AppError('Только наставник может создавать встречи', 403);

  const meeting = await prisma.meeting.create({
    data,
    include: {
      creator: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  createNotification({
    userId: pair.employeeId,
    text: `Наставник запланировал встречу`,
    link: '/employee/dashboard',
  }).catch(() => {});

  return meeting;
}

export async function getMeetingsByPair(pairId: string) {
  return prisma.meeting.findMany({
    where: { pairId },
    include: {
      creator: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { scheduledAt: 'desc' },
  });
}

export async function updateMeeting(
  id: string,
  data: Partial<{ scheduledAt: Date; notes: string; summary: string }>,
  mentorId: string,
) {
  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: { pair: true },
  });
  if (!meeting) throw new AppError('Встреча не найдена', 404);
  if (meeting.pair.mentorId !== mentorId) throw new AppError('Нет доступа', 403);

  return prisma.meeting.update({
    where: { id },
    data,
    include: {
      creator: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function deleteMeeting(id: string, mentorId: string) {
  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: { pair: true },
  });
  if (!meeting) throw new AppError('Встреча не найдена', 404);
  if (meeting.pair.mentorId !== mentorId) throw new AppError('Нет доступа', 403);

  return prisma.meeting.delete({ where: { id } });
}
