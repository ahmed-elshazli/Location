import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sellUnitApi } from '../api/unitsApi';

export const useSellUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sellUnitApi,
    onSuccess: () => {
      // ✅ تحديث كاش الوحدات والمشاريع عشان الـ Progress Bar يتحدث
      queryClient.invalidateQueries({ queryKey: ['units'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects-stats'] });
    },
  });
};