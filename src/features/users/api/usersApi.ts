import { api } from '../../../utils/axios';

export const fetchUsers = async () => {
  // التوكن هيتبعت أوتوماتيك بفضل الـ Interceptor اللي عملناه
  const response = await api.get('/api/v1/users');
  return response.data; // السيرفر هيرد بمصفوفة Users
};

export const updateUser = async ({ id, data }: { id: string; data: any }) => {
  const response = await api.put(`/api/v1/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: string) => {
  // إرسال طلب DELETE للمسار المحدد
  const response = await api.delete(`/api/v1/users/${id}`);
  return response.data;
};