import client from './client';
import { ApiResponse } from '../types';

export const dashboardApi = {
  get: () => client.get<ApiResponse>('/dashboard'),
};
