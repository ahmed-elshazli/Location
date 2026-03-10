import { useQuery } from '@tanstack/react-query';
import { api } from '../../../utils/axios';

const getDeals = async (page: number) => {
  const response = await api.get('/api/v1/deals', {
    params: { page, limit: 10 },
  });
  return response.data;
};

export const useDeals = (page: number = 1) =>
  useQuery({
    queryKey: ['deals-all', page],
    queryFn:  () => getDeals(page),
    staleTime: 5 * 60 * 1000,
  });