import { api } from '../../../utils/axios';

export interface FetchLeadsParams {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: string;
}

export const getLeadsApi = async (params: FetchLeadsParams = {}) => {
  const { page = 1, limit = 10, keyword, status } = params;
  const query: Record<string, any> = { page, limit };
  if (keyword) query.keyword = keyword;
  if (status && status !== 'all') query.status = status;
  const response = await api.get('/api/v1/leads', { params: query });
  return response.data;
};

export const createLeadApi = async (data: any) => {
  const response = await api.post('/api/v1/leads', data);
  return response.data;
};

export const updateLeadApi = async (id: string, data: any) => {
  const response = await api.patch(`/api/v1/leads/${id}`, data);
  return response.data;
};

export const updateLeadStatusApi = async (id: string, status: string) => {
  const response = await api.patch(`/api/v1/leads/${id}/status`, { status });
  return response.data;
};

export const deleteLeadApi = async (id: string) => {
  const response = await api.delete(`/api/v1/leads/${id}`);
  return response.data;
};