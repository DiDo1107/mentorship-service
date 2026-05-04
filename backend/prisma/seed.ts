import { PrismaClient, Role, PairStatus, TaskPriority, TaskStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Начало заполнения базы данных...');

  // Очистка данных
  await prisma.feedback.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.task.deleteMany();
  await prisma.mentorPair.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('password123', 10);

  // HR
  const hr = await prisma.user.create({
    data: {
      email: 'hr@company.ru',
      password,
      firstName: 'Анна',
      lastName: 'Иванова',
      role: Role.hr,
    },
  });

  // Наставники
  const mentor1 = await prisma.user.create({
    data: {
      email: 'mentor1@company.ru',
      password,
      firstName: 'Дмитрий',
      lastName: 'Петров',
      role: Role.mentor,
    },
  });

  const mentor2 = await prisma.user.create({
    data: {
      email: 'mentor2@company.ru',
      password,
      firstName: 'Елена',
      lastName: 'Сидорова',
      role: Role.mentor,
    },
  });

  // Новые сотрудники
  const emp1 = await prisma.user.create({
    data: {
      email: 'employee1@company.ru',
      password,
      firstName: 'Алексей',
      lastName: 'Козлов',
      role: Role.employee,
    },
  });

  const emp2 = await prisma.user.create({
    data: {
      email: 'employee2@company.ru',
      password,
      firstName: 'Мария',
      lastName: 'Новикова',
      role: Role.employee,
    },
  });

  const emp3 = await prisma.user.create({
    data: {
      email: 'employee3@company.ru',
      password,
      firstName: 'Сергей',
      lastName: 'Морозов',
      role: Role.employee,
    },
  });

  // Пары наставничества
  const pair1 = await prisma.mentorPair.create({
    data: {
      mentorId: mentor1.id,
      employeeId: emp1.id,
      hrId: hr.id,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-04-15'),
      status: PairStatus.active,
    },
  });

  const pair2 = await prisma.mentorPair.create({
    data: {
      mentorId: mentor1.id,
      employeeId: emp2.id,
      hrId: hr.id,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-05-01'),
      status: PairStatus.active,
    },
  });

  const pair3 = await prisma.mentorPair.create({
    data: {
      mentorId: mentor2.id,
      employeeId: emp3.id,
      hrId: hr.id,
      startDate: new Date('2024-01-20'),
      endDate: new Date('2024-04-20'),
      status: PairStatus.active,
    },
  });

  // Задачи для пары 1
  await prisma.task.createMany({
    data: [
      {
        pairId: pair1.id,
        title: 'Ознакомление с корпоративными стандартами',
        description: 'Изучить внутренние регламенты и политики компании',
        deadline: new Date('2024-01-25'),
        priority: TaskPriority.high,
        status: TaskStatus.completed,
      },
      {
        pairId: pair1.id,
        title: 'Настройка рабочего окружения',
        description: 'Установить все необходимые программы и инструменты',
        deadline: new Date('2024-01-20'),
        priority: TaskPriority.high,
        status: TaskStatus.completed,
      },
      {
        pairId: pair1.id,
        title: 'Знакомство с командой',
        description: 'Провести встречи с ключевыми членами команды',
        deadline: new Date('2024-02-01'),
        priority: TaskPriority.medium,
        status: TaskStatus.in_progress,
      },
      {
        pairId: pair1.id,
        title: 'Первый самостоятельный проект',
        description: 'Выполнить небольшой тестовый проект под руководством наставника',
        deadline: new Date('2024-03-01'),
        priority: TaskPriority.medium,
        status: TaskStatus.not_started,
      },
    ],
  });

  // Задачи для пары 2
  await prisma.task.createMany({
    data: [
      {
        pairId: pair2.id,
        title: 'Изучение продуктовой линейки',
        description: 'Ознакомиться со всеми продуктами компании',
        deadline: new Date('2024-02-10'),
        priority: TaskPriority.high,
        status: TaskStatus.completed,
      },
      {
        pairId: pair2.id,
        title: 'Обучение работе с CRM',
        description: 'Пройти обучение по работе с системой управления клиентами',
        deadline: new Date('2024-02-20'),
        priority: TaskPriority.high,
        status: TaskStatus.in_progress,
      },
      {
        pairId: pair2.id,
        title: 'Первый контакт с клиентом',
        description: 'Провести первый самостоятельный звонок клиенту',
        deadline: new Date('2024-03-10'),
        priority: TaskPriority.low,
        status: TaskStatus.not_started,
      },
    ],
  });

  // Задачи для пары 3
  await prisma.task.createMany({
    data: [
      {
        pairId: pair3.id,
        title: 'Знакомство с технологическим стеком',
        description: 'Изучить технологии, используемые в отделе',
        deadline: new Date('2024-02-01'),
        priority: TaskPriority.high,
        status: TaskStatus.completed,
      },
      {
        pairId: pair3.id,
        title: 'Code review первого PR',
        description: 'Подготовить и отправить на ревью первый pull request',
        deadline: new Date('2024-02-15'),
        priority: TaskPriority.medium,
        status: TaskStatus.in_progress,
      },
    ],
  });

  // Встречи 1-on-1
  await prisma.meeting.createMany({
    data: [
      {
        pairId: pair1.id,
        creatorId: mentor1.id,
        scheduledAt: new Date('2024-01-16T10:00:00Z'),
        notes: 'Вводная встреча, обсуждение плана адаптации',
        summary: 'Согласован план на первые 3 месяца. Алексей готов к работе.',
      },
      {
        pairId: pair1.id,
        creatorId: mentor1.id,
        scheduledAt: new Date('2024-01-23T10:00:00Z'),
        notes: 'Проверка выполнения первых задач',
        summary: 'Первые задачи выполнены. Хороший прогресс.',
      },
      {
        pairId: pair1.id,
        creatorId: mentor1.id,
        scheduledAt: new Date('2024-02-06T10:00:00Z'),
        notes: 'Еженедельная встреча',
      },
      {
        pairId: pair2.id,
        creatorId: mentor1.id,
        scheduledAt: new Date('2024-02-02T11:00:00Z'),
        notes: 'Первая встреча с Марией',
        summary: 'Обсудили цели и задачи. Составили план обучения.',
      },
      {
        pairId: pair3.id,
        creatorId: mentor2.id,
        scheduledAt: new Date('2024-01-21T14:00:00Z'),
        notes: 'Знакомство, обсуждение технических задач',
        summary: 'Сергей хорошо подготовлен технически. Быстрое вхождение в работу.',
      },
    ],
  });

  // Обратная связь
  await prisma.feedback.createMany({
    data: [
      {
        pairId: pair1.id,
        giverId: emp1.id,
        receiverId: mentor1.id,
        rating: 5,
        comment: 'Отличный наставник! Очень помогает и объясняет понятно.',
      },
      {
        pairId: pair1.id,
        giverId: mentor1.id,
        receiverId: emp1.id,
        rating: 4,
        comment: 'Алексей быстро обучается и активно задаёт вопросы.',
      },
    ],
  });

  console.log('База данных успешно заполнена!');
  console.log('\nТестовые учётные данные:');
  console.log('HR:         hr@company.ru / password123');
  console.log('Наставник 1: mentor1@company.ru / password123');
  console.log('Наставник 2: mentor2@company.ru / password123');
  console.log('Сотрудник 1: employee1@company.ru / password123');
  console.log('Сотрудник 2: employee2@company.ru / password123');
  console.log('Сотрудник 3: employee3@company.ru / password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
