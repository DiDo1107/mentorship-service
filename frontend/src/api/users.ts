import client from './client';
import { ApiResponse, User, Role } from '../types';

export const usersApi = {
  getAll: (role?: Role) =>
    client.get<ApiResponse<User[]>>('/users', { params: role ? { role } : undefined }),

  getById: (id: string) =>
    client.get<ApiResponse<User>>(`/users/${id}`),

  update: (id: string, data: Partial<Pick<User, 'firstName' | 'lastName' | 'email' | 'role'>>) =>
    client.patch<ApiResponse<User>>(`/users/${id}`, data),

  create: (data: { email: string; password: string; firstName: string; lastName: string; role: Role }) =>
    client.post<ApiResponse<User>>('/users', data),

  delete: (id: string) =>
    client.delete<ApiResponse>(`/users/${id}`),
};
