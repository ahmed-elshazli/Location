import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClientApi } from '../api/clientsApi';

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createClientApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  });
};