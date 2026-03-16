import { api } from '../../../utils/axios';

export interface FetchAreasParams {
  page?: number;
  limit?: number;
  keyword?: string;
  type?: string;
}

export const getAreasApi = async (params: FetchAreasParams = {}) => {
  const { page = 1, limit = 9, keyword, type } = params;
  const query: Record<string, any> = { page, limit };
  if (keyword) query.keyword = keyword;
  if (type && type !== 'all') query.type = type;
  const response = await api.get('/api/v1/areas', { params: query });
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