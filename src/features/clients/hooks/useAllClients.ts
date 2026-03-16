import { useQuery } from '@tanstack/react-query';
import { getAllClientsApi } from '../api/clientsApi';

export const useAllClients = () => {
  return useQuery({
    queryKey: ['clients-all'],
    queryFn: () => getAllClientsApi({ page: 1, limit: 1000 }),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
};