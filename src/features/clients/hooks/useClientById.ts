import { useQuery } from '@tanstack/react-query';
import { getClientByIdApi } from '../api/clientsApi';

export const useClientById = (id: string | null) => {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => getClientByIdApi(id!),
    enabled: !!id,   // مش بيشتغل لو الـ id فاضي
  });
};