import { useQuery } from '@tanstack/react-query';
import { getUserByIdApi } from '../api/usersApi';

export const useGetProfile = (id: string | null) => {
  return useQuery({
    queryKey: ['profile', id],
    queryFn: () => getUserByIdApi(id!),
    enabled: !!id,
    staleTime: 0,
  });
};