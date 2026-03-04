import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUnitApi } from '../api/unitsApi';

export const useUpdateUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUnitApi,
    onSuccess: () => {
      // ✅ تحديث الكاش فوراً لمزامنة البيانات في كل الصفحات
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });
};