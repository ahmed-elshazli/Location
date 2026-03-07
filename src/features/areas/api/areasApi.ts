// src/api/areasApi.ts
import { api } from '../../../utils/axios';

export const getAreasApi = async ({ page = 1, limit = 9 }: { page?: number; limit?: number } = {}) => {
  const response = await api.get('/api/v1/areas', { params: { page, limit } });
  return response.data;
};

export const getAreaByIdApi = async (id: string) => {
  const response = await api.get(`/api/v1/areas/${id}`);
  return response.data;
};

export const createAreaApi = async (formData: FormData) => {
  const response = await api.post('/api/v1/areas', formData);
  return response.data;
};

export const updateAreaApi = async ({ id, data }: { id: string; data: FormData }) => {
  const response = await api.patch(`/api/v1/areas/${id}`, data);
  return response.data;
};

export const deleteAreaApi = async (id: string) => {
  const response = await api.delete(`/api/v1/areas/${id}`);
  return response.data;
};