import { PrismaClient, PairStatus } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

const pairSelect = {
  id: true,
  startDate: true,
  endDate: true,
  status: true,
  createdAt: true,
  mentor: { select: { id: true, firstName: true, lastName: true, email: true } },
  employee: { select: { id: true, firstName: true, lastName: true, email: true } },
  hr: { select: { id: true, firstName: true, lastName: true, email: true } },
};

export async function createPair(data: {
  mentorId: string;
  employeeId: string;
  hrId: string;
  startDate: Date;
  endDate: Date;
}) {
  const existing = await prisma.mentorPair.findFirst({
    where: { employeeId: data.employeeId, status: PairStatus.active },
  });
  if (existing) throw new AppError('У этого сотрудника уже есть активная пара наставничества', 409);

  return prisma.mentorPair.create({ data, select: pairSelect });
}

export async function getAllPairs(filters?: { status?: PairStatus }) {
  return prisma.mentorPair.findMany({
    where: filters?.status ? { status: filters.status } : undefined,
    select: {
      ...pairSelect,
      tasks: { select: { id: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPairsByMentor(mentorId: string) {
  return prisma.mentorPair.findMany({
    where: { mentorId },
    select: {
      ...pairSelect,
      tasks: { select: { id: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPairByEmployee(employeeId: string) {
  return prisma.mentorPair.findFirst({
    where: { employeeId, status: PairStatus.active },
    select: {
      ...pairSelect,
      tasks: true,
      meetings: { orderBy: { scheduledAt: 'asc' } },
    },
  });
}

export async function getPairById(id: string) {
  const pair = await prisma.mentorPair.findUnique({
    where: { id },
    select: {
      ...pairSelect,
      tasks: { orderBy: { deadline: 'asc' } },
      meetings: { orderBy: { scheduledAt: 'desc' } },
      feedback: {
        include: {
          giver: { select: { id: true, firstName: true, lastName: true, role: true } },
          receiver: { select: { id: true, firstName: true, lastName: true, role: true } },
        },
      },
    },
  });
  if (!pair) throw new AppError('Пара не найдена', 404);
  return pair;
}

export async function updatePairStatus(id: string, status: PairStatus) {
  const pair = await prisma.mentorPair.findUnique({ where: { id } });
  if (!pair) throw new AppError('Пара не найдена', 404);

  return prisma.mentorPair.update({
    where: { id },
    data: { status },
    select: pairSelect,
  });
}
