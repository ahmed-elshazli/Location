// src/hooks/useUsers.ts
import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '../api/usersApi';
import { api } from '../../../utils/axios';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'], // مفتاح الكاش
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000, // البيانات تفضل "فريش" لمدة 5 دقائق
  });
};

export const updateUser = async ({ id, data }: { id: string; data: any }) => {
  const response = await api.put(`/api/v1/users/${id}`, data);
  return response.data;
};