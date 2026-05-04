import client from './client';
import { ApiResponse, Meeting } from '../types';

export const meetingsApi = {
  getByPair: (pairId: string) =>
    client.get<ApiResponse<Meeting[]>>(`/meetings/pair/${pairId}`),

  create: (data: { pairId: string; scheduledAt: string; notes?: string }) =>
    client.post<ApiResponse<Meeting>>('/meetings', data),

  update: (id: string, data: Partial<{ scheduledAt: string; notes: string; summary: string }>) =>
    client.patch<ApiResponse<Meeting>>(`/meetings/${id}`, data),

  delete: (id: string) =>
    client.delete<ApiResponse>(`/meetings/${id}`),
};
