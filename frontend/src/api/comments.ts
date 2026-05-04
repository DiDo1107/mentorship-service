import client from './client';
import { ApiResponse, TaskComment } from '../types';

export const commentsApi = {
  getByTask: (taskId: string) =>
    client.get<ApiResponse<TaskComment[]>>(`/comments/task/${taskId}`),

  create: (taskId: string, text: string) =>
    client.post<ApiResponse<TaskComment>>('/comments', { taskId, text }),
};
