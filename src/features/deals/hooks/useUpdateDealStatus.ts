import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateDealStatusApi } from '../api/dealsApi';

export const useUpdateDealStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDealStatusApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals-summary'] });
    },
  });
};