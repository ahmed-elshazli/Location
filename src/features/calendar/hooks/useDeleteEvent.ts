import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteEventApi } from '../api/eventsApi';

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEventApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });
};