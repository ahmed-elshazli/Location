import { api } from '../../../utils/axios';

export const getLeadsApi = async (page: number = 1, limit: number = 10) => {
  const response = await api.get('/api/v1/leads', { params: { page, limit } });
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