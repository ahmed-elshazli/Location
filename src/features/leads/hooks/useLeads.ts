import { useQuery } from '@tanstack/react-query';
import { getLeadsApi } from '../api/leadsApi';

export const useLeads = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['leads', page, limit],
    queryFn: () => getLeadsApi(page, limit),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
};