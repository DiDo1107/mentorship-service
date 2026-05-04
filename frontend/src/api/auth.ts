import client from './client';
import { ApiResponse, User } from '../types';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'hr' | 'mentor' | 'employee';
}

export const authApi = {
  login: (email: string, password: string) =>
    client.post<ApiResponse<LoginResponse>>('/auth/login', { email, password }),

  register: (data: RegisterData) =>
    client.post<ApiResponse<User>>('/auth/register', data),

  refresh: (refreshToken: string) =>
    client.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', {
      refreshToken,
    }),

  logout: (refreshToken: string) =>
    client.post<ApiResponse>('/auth/logout', { refreshToken }),

  me: () => client.get<ApiResponse<User>>('/auth/me'),

  getUsers: (role?: string) =>
    client.get<ApiResponse<User[]>>('/auth/users', { params: role ? { role } : undefined }),
};
