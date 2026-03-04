import { useQuery } from '@tanstack/react-query';
import { getDealsApi } from '../api/dealsApi';

export const useDeals = () => {
  return useQuery({
    queryKey: ['deals'],
    queryFn: getDealsApi,
    // نصيحة سينيور: خلي الـ staleTime كبير شوية لو الصفقات مش بتتغير كل ثانية
    staleTime: 5 * 60 * 1000, 
  });
};