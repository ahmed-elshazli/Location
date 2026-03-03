import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteDeveloperApi } from '../api/developersApi';

export const useDeleteDeveloper = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDeveloperApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developers'] });
      queryClient.invalidateQueries({ queryKey: ['developers-summary'] });
    },
  });
};