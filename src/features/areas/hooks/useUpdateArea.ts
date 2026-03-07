// src/features/areas/hooks/useUpdateArea.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAreaApi } from '../api/areasApi';

export const useUpdateArea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAreaApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
    },
  });
};