import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUnitApi } from '../api/unitsApi';

export const useCreateUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUnitApi,
    onSuccess: () => {
      // ✅ تحديث كاش الوحدات والمشاريع والإحصائيات
      queryClient.invalidateQueries({ queryKey: ['units'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects-stats'] });
    },
  });
};