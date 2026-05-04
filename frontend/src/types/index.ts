export type Role = 'hr' | 'mentor' | 'employee';
export type PairStatus = 'active' | 'completed' | 'paused';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'not_started' | 'in_progress' | 'completed';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt: string;
}

export interface MentorPair {
  id: string;
  mentorId: string;
  employeeId: string;
  hrId: string;
  startDate: string;
  endDate: string;
  status: PairStatus;
  createdAt: string;
  mentor: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
  employee: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
  hr: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
  tasks?: Task[];
  meetings?: Meeting[];
  feedback?: Feedback[];
  progress?: number;
  overdueTasks?: number;
}

export interface Task {
  id: string;
  pairId: string;
  title: string;
  description?: string;
  deadline: string;
  priority: TaskPriority;
  status: TaskStatus;
  fileName?: string;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  id: string;
  pairId: string;
  creatorId: string;
  scheduledAt: string;
  notes?: string;
  summary?: string;
  createdAt: string;
  creator?: Pick<User, 'id' | 'firstName' | 'lastName'>;
}

export interface Feedback {
  id: string;
  pairId: string;
  giverId: string;
  receiverId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  giver?: Pick<User, 'id' | 'firstName' | 'lastName' | 'role'>;
  receiver?: Pick<User, 'id' | 'firstName' | 'lastName' | 'role'>;
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  text: string;
  createdAt: string;
  author: Pick<User, 'id' | 'firstName' | 'lastName' | 'role'>;
}

export interface Notification {
  id: string;
  userId: string;
  text: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}
