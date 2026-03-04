import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateDealApi } from '../api/dealsApi';

export const useUpdateDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDealApi,
    onSuccess: () => {
      // ✅ تحديث كاش الصفقات فوراً لمزامنة الـ Pipeline
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
};