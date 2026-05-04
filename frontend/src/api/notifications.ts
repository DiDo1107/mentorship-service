import client from './client';
import { ApiResponse, Notification } from '../types';

export const notificationsApi = {
  getAll: () => client.get<ApiResponse<Notification[]>>('/notifications'),
  getUnreadCount: () => client.get<ApiResponse<number>>('/notifications/unread-count'),
  markAllRead: () => client.post<ApiResponse>('/notifications/mark-read'),
};
