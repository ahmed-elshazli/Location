import { useQuery } from '@tanstack/react-query';
import { getLeadsApi, FetchLeadsParams } from '../api/leadsApi';

export const useLeads = (params: FetchLeadsParams = {}) => {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => getLeadsApi(params),
    staleTime: 0,
    placeholderData: (prev) => prev,
  });
};