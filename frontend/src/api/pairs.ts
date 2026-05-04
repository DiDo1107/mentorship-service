import client from './client';
import { ApiResponse, MentorPair, PairStatus } from '../types';

export const pairsApi = {
  getAll: (status?: PairStatus) =>
    client.get<ApiResponse<MentorPair[]>>('/pairs', { params: status ? { status } : undefined }),

  getById: (id: string) =>
    client.get<ApiResponse<MentorPair>>(`/pairs/${id}`),

  create: (data: { mentorId: string; employeeId: string; startDate: string; endDate: string }) =>
    client.post<ApiResponse<MentorPair>>('/pairs', data),

  updateStatus: (id: string, status: PairStatus) =>
    client.patch<ApiResponse<MentorPair>>(`/pairs/${id}/status`, { status }),
};
