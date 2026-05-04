import { PrismaClient, TaskStatus, PairStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function getHRDashboard() {
  const [pairs, allTasks, overdueTasks, users] = await Promise.all([
    prisma.mentorPair.findMany({
      select: {
        id: true,
        status: true,
        startDate: true,
        endDate: true,
        mentor: { select: { id: true, firstName: true, lastName: true } },
        employee: { select: { id: true, firstName: true, lastName: true } },
        tasks: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.task.count(),
    prisma.task.count({
      where: {
        deadline: { lt: new Date() },
        status: { not: TaskStatus.completed },
      },
    }),
    prisma.user.groupBy({ by: ['role'], _count: true }),
  ]);

  const completedTasks = await prisma.task.count({ where: { status: TaskStatus.completed } });
  const activePairs = pairs.filter((p) => p.status === PairStatus.active).length;

  const pairsWithProgress = pairs.map((pair) => {
    const total = pair.tasks.length;
    const done = pair.tasks.filter((t) => t.status === TaskStatus.completed).length;
    return {
      ...pair,
      progress: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  });

  return {
    summary: {
      totalPairs: pairs.length,
      activePairs,
      totalTasks: allTasks,
      completedTasks,
      overdueTasks,
      completionRate: allTasks > 0 ? Math.round((completedTasks / allTasks) * 100) : 0,
      users: users.reduce(
        (acc, u) => ({ ...acc, [u.role]: u._count }),
        {} as Record<string, number>,
      ),
    },
    pairs: pairsWithProgress,
  };
}

export async function getMentorDashboard(mentorId: string) {
  const pairs = await prisma.mentorPair.findMany({
    where: { mentorId },
    include: {
      employee: { select: { id: true, firstName: true, lastName: true, email: true } },
      tasks: { select: { id: true, status: true, deadline: true } },
      meetings: {
        where: { scheduledAt: { gte: new Date() } },
        orderBy: { scheduledAt: 'asc' },
        take: 3,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return pairs.map((pair) => {
    const total = pair.tasks.length;
    const done = pair.tasks.filter((t) => t.status === TaskStatus.completed).length;
    const overdue = pair.tasks.filter(
      (t) => t.deadline < new Date() && t.status !== TaskStatus.completed,
    ).length;

    return {
      ...pair,
      progress: total > 0 ? Math.round((done / total) * 100) : 0,
      overdueTasks: overdue,
    };
  });
}

export async function getEmployeeDashboard(employeeId: string) {
  const pair = await prisma.mentorPair.findFirst({
    where: { employeeId, status: PairStatus.active },
    include: {
      mentor: { select: { id: true, firstName: true, lastName: true, email: true } },
      tasks: { orderBy: [{ status: 'asc' }, { deadline: 'asc' }] },
      meetings: {
        where: { scheduledAt: { gte: new Date() } },
        orderBy: { scheduledAt: 'asc' },
        take: 3,
      },
    },
  });

  if (!pair) return null;

  const total = pair.tasks.length;
  const done = pair.tasks.filter((t) => t.status === TaskStatus.completed).length;
  const overdue = pair.tasks.filter(
    (t) => t.deadline < new Date() && t.status !== TaskStatus.completed,
  ).length;

  return {
    pair,
    progress: total > 0 ? Math.round((done / total) * 100) : 0,
    overdueTasks: overdue,
    upcomingTasks: pair.tasks
      .filter((t) => t.status !== TaskStatus.completed)
      .slice(0, 5),
  };
}
