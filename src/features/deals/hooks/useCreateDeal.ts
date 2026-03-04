import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDealApi } from '../api/dealsApi';

export const useCreateDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDealApi,
    onSuccess: () => {
      // ✅ تحديث كاش الصفقات فوراً لمزامنة الـ Pipeline
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
};