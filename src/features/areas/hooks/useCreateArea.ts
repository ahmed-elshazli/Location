// src/features/areas/hooks/useCreateArea.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAreaApi } from '../api/areasApi';

export const useCreateArea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAreaApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
    },
  });
};