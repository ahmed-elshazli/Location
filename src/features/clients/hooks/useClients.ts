import { useQuery } from '@tanstack/react-query';
import { getAllClientsApi, FetchClientsParams } from '../api/clientsApi';

export const useClients = (params: FetchClientsParams = {}) => {
  return useQuery({
    queryKey: ['clients', params],
    queryFn: () => getAllClientsApi(params),
    staleTime: 0,
    placeholderData: (prev) => prev,
  });
};