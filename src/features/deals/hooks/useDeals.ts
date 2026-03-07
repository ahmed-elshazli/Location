import { useQuery } from '@tanstack/react-query';
import { getAllDealsApi } from '../api/dealsApi';

export const useDeals = (page: number = 1) => {
  return useQuery({
    queryKey: ['deals', page],
    queryFn: () => getAllDealsApi(page),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
};