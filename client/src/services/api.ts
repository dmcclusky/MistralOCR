import axios from 'axios';
import type { OCRResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export async function processFile(file: File): Promise<OCRResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<OCRResponse>('/api/ocr/process', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

export async function processUrl(documentUrl: string): Promise<OCRResponse> {
  const response = await api.post<OCRResponse>('/api/ocr/process-url', {
    documentUrl,
  });

  return response.data;
}

export default api;
