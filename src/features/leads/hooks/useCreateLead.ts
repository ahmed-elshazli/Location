import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createLeadApi } from '../api/leadsApi';

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLeadApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });
};