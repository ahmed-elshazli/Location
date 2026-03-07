import { useQuery } from '@tanstack/react-query';
import { getAllClientsApi } from '../api/clientsApi';

export const useAllClients = () => {
  return useQuery({
    queryKey: ['clients-all'],
    queryFn: () => getAllClientsApi(1),
    staleTime: 5 * 60 * 1000,
  });
};