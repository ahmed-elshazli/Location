import { api } from '../../../utils/axios';

export interface FetchUsersParams {
  page?: number;
  keyword?: string;
  role?: string;
  isActive?: string;
}

export const fetchUsers = async (params: FetchUsersParams = {}) => {
  const { page = 1, keyword, role, isActive } = params;
  const query: Record<string, any> = { page, limit: 10 };
  if (keyword)  query.keyword  = keyword;
  if (role)     query.role     = role;
  if (isActive !== undefined) query.isActive = isActive;
  const response = await api.get('/api/v1/users', { params: query });
  return response.data;
};

export const createUserApi = async (data: FormData) => {
  const response = await api.post('/api/v1/auth/register', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateUser = async ({ id, data }: { id: string; data: FormData }) => {
  const response = await api.patch(`/api/v1/users/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deactivateUser = async (id: string) => {
  const response = await api.patch(`/api/v1/users/${id}/activations`);
  return response.data;
};

export const deleteUserPermanently = async (id: string) => {
  const response = await api.delete(`/api/v1/users/${id}/delete`);
  return response.data;
};

export const getUserByIdApi = async (id: string) => {
  const response = await api.get(`/api/v1/users/${id}`);
  return response.data;
};

export const deleteUser = deleteUserPermanently;

export const changeUserPasswordApi = async (id: string, password: string) => {
  const response = await api.patch(`/api/v1/users/${id}`, { password });
  return response.data;
};