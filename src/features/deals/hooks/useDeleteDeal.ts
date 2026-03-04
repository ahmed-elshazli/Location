import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteDealApi } from '../api/dealsApi';
import { useToastStore } from '../../../store/useToastStore';

export const useDeleteDeal = () => {
  const queryClient = useQueryClient();
  const { triggerToast } = useToastStore();

  return useMutation({
    mutationFn: deleteDealApi,
    onSuccess: () => {
      // ✅ تحديث كل الكاش المرتبط بالصفقات فوراً
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals-summary'] });
      triggerToast("تم حذف الصفقة بنجاح 🗑️", "success");
    },
    onError: (err: any) => {
      triggerToast(err.response?.data?.message || "فشل الحذف", "error");
    }
  });
};