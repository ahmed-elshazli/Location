import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchUsers, FetchUsersParams } from '../api/usersApi';

export const useUsers = (params: FetchUsersParams = {}) =>
  useQuery({
    queryKey: ['users-all', params],
    queryFn:  () => fetchUsers(params),
    staleTime: 0,
    placeholderData: keepPreviousData,
  });