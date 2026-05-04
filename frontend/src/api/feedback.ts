import client from './client';
import { ApiResponse, Feedback } from '../types';

export const feedbackApi = {
  getByPair: (pairId: string) =>
    client.get<ApiResponse<Feedback[]>>(`/feedback/pair/${pairId}`),

  create: (data: { pairId: string; receiverId: string; rating: number; comment?: string }) =>
    client.post<ApiResponse<Feedback>>('/feedback', data),

  update: (id: string, data: { rating?: number; comment?: string }) =>
    client.patch<ApiResponse<Feedback>>(`/feedback/${id}`, data),
};
