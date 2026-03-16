import { api } from '../../../utils/axios';

export interface FetchClientsParams {
  page?: number;
  limit?: number;
  keyword?: string;
}

export const getAllClientsApi = async (params: FetchClientsParams = {}) => {
  const { page = 1, limit = 10, keyword } = params;
  const query: Record<string, any> = { page, limit };
  if (keyword) query.keyword = keyword;
  const response = await api.get('/api/v1/clients', { params: query });
  return response.data;
};

export const getClientByIdApi = async (id: string) => {
  const response = await api.get(`/api/v1/clients/${id}`);
  return response.data;
};

export const createClientApi = async (data: any) => {
  const response = await api.post('/api/v1/clients', data);
  return response.data;
};

export const updateClientApi = async ({ id, data }: { id: string; data: any }) => {
  const response = await api.patch(`/api/v1/clients/${id}`, data);
  return response.data;
};

export const deleteClientApi = async (id: string) => {
  const response = await api.delete(`/api/v1/clients/${id}`);
  return response.data;
};

export const fetchClientAnalytics = async (id: string) => {
  const res = await api.get(`/api/v1/clients/${id}/analytics`);
  return res.data;
};