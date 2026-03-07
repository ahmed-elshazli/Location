import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteLeadApi } from '../api/leadsApi';

export const useDeleteLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLeadApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });
};