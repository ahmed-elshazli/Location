import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '../api/usersApi';

export const useUsers = (page: number = 1) =>
  useQuery({
    queryKey: ['users-all', page],
    queryFn:  () => fetchUsers(page),
    staleTime: 5 * 60 * 1000,
  });