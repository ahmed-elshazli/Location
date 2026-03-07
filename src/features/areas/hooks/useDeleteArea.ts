// src/features/areas/hooks/useDeleteArea.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAreaApi } from '../api/areasApi';

export const useDeleteArea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAreaApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
    },
  });
};