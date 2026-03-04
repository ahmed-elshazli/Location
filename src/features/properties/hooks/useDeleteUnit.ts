import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteUnitApi } from '../api/unitsApi';

export const useDeleteUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUnitApi,
    onSuccess: () => {
      // ✅ تحديث كاش الوحدات فوراً لمزامنة البيانات في الواجهة
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });
};