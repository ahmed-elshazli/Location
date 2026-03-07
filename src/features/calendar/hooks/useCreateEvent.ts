import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEventApi } from '../api/eventsApi';

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEventApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });
};