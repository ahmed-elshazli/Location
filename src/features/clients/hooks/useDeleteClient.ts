import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteClientApi } from '../api/clientsApi';

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteClientApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  });
};