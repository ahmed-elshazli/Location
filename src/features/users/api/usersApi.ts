import { api } from '../../../utils/axios';

export const fetchUsers = async (page: number = 1) => {
  const response = await api.get('/api/v1/users', { params: { page, limit: 10 } });
  return response.data;
};

export const createUserApi = async (data: FormData) => {
  const response = await api.post('/api/v1/auth/register', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateUser = async ({ id, data }: { id: string; data: FormData }) => {
  const response = await api.put(`/api/v1/users/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deactivateUser = async (id: string) => {
  const response = await api.delete(`/api/v1/users/${id}`);
  return response.data;
};

export const deleteUserPermanently = async (id: string) => {
  const response = await api.delete(`/api/v1/users/${id}/delete`);
  return response.data;
};