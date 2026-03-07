import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateClientApi } from '../api/clientsApi';

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateClientApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  });
};