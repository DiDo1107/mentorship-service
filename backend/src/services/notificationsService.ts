import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createNotification(data: {
  userId: string;
  text: string;
  link?: string;
}) {
  return prisma.notification.create({ data });
}

export async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function markAllRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, read: false } });
}
