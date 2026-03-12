import { useQuery } from '@tanstack/react-query';
import { getDealByIdApi } from '../api/dealsApi';

export const useGetDeal = (id: string | null) => {
  return useQuery({
    queryKey: ['deal', id],
    queryFn: () => getDealByIdApi(id!),
    enabled: !!id,
    staleTime: 0, // دايماً يجيب fresh data
  });
};