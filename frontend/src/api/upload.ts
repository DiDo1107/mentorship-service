import client from './client';
import { ApiResponse } from '../types';

export const uploadApi = {
  uploadPdf: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return client.post<ApiResponse<{ fileName: string; fileUrl: string }>>('/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
