import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateEventApi } from '../api/eventsApi';

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateEventApi(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });
};