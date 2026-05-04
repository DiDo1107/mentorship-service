import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { createNotification } from './notificationsService';

const prisma = new PrismaClient();

export async function createFeedback(data: {
  pairId: string;
  giverId: string;
  receiverId: string;
  rating: number;
  comment?: string;
}) {
  const pair = await prisma.mentorPair.findUnique({ where: { id: data.pairId } });
  if (!pair) throw new AppError('Пара не найдена', 404);

  const isParticipant =
    pair.mentorId === data.giverId || pair.employeeId === data.giverId;
  if (!isParticipant) throw new AppError('Нет доступа к этой паре', 403);

  const existing = await prisma.feedback.findFirst({
    where: { pairId: data.pairId, giverId: data.giverId },
  });
  if (existing) throw new AppError('Вы уже оставили обратную связь для этой пары', 409);

  const feedback = await prisma.feedback.create({
    data,
    include: {
      giver: { select: { id: true, firstName: true, lastName: true, role: true } },
      receiver: { select: { id: true, firstName: true, lastName: true, role: true } },
    },
  });

  createNotification({
    userId: data.receiverId,
    text: `Вы получили новый отзыв`,
    link: data.giverId === pair.mentorId ? '/employee/dashboard' : '/mentor/dashboard',
  }).catch(() => {});

  return feedback;
}

export async function getFeedbackByPair(pairId: string) {
  return prisma.feedback.findMany({
    where: { pairId },
    include: {
      giver: { select: { id: true, firstName: true, lastName: true, role: true } },
      receiver: { select: { id: true, firstName: true, lastName: true, role: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateFeedback(
  id: string,
  data: { rating?: number; comment?: string },
  giverId: string,
) {
  const feedback = await prisma.feedback.findUnique({ where: { id } });
  if (!feedback) throw new AppError('Обратная связь не найдена', 404);
  if (feedback.giverId !== giverId) throw new AppError('Нет доступа', 403);

  return prisma.feedback.update({
    where: { id },
    data,
    include: {
      giver: { select: { id: true, firstName: true, lastName: true, role: true } },
      receiver: { select: { id: true, firstName: true, lastName: true, role: true } },
    },
  });
}
