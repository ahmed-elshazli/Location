import { api } from '../../../utils/axios';

export const getAllClientsApi = async (page: number = 1) => {
  const response = await api.get('/api/v1/clients', {
    params: { page, limit: 10 },
  });
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