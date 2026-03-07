import { useQuery } from '@tanstack/react-query';
import { getAllClientsApi } from '../api/clientsApi';

export const useClients = (page: number = 1) => {
  return useQuery({
    queryKey: ['clients', page],
    queryFn: () => getAllClientsApi(page),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
};