import client from './client';
import { ApiResponse, Task, TaskPriority, TaskStatus } from '../types';

export const tasksApi = {
  getByPair: (pairId: string) =>
    client.get<ApiResponse<Task[]>>(`/tasks/pair/${pairId}`),

  create: (data: {
    pairId: string;
    title: string;
    description?: string;
    deadline: string;
    priority: TaskPriority;
    fileName?: string;
    fileUrl?: string;
  }) => client.post<ApiResponse<Task>>('/tasks', data),

  update: (
    id: string,
    data: Partial<{
      title: string;
      description: string;
      deadline: string;
      priority: TaskPriority;
      status: TaskStatus;
    }>,
  ) => client.patch<ApiResponse<Task>>(`/tasks/${id}`, data),

  delete: (id: string) =>
    client.delete<ApiResponse>(`/tasks/${id}`),
};
