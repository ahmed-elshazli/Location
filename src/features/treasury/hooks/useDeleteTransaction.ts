import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTransactionApi } from '../api/treasuryApi';
import { useToastStore } from '../../../store/useToastStore';

export const useDeleteTransaction = () => {
  const queryClient  = useQueryClient();
  const { triggerToast } = useToastStore();

  return useMutation({
    mutationFn: (id: string) => deleteTransactionApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-stats'] });
      triggerToast('تم حذف المعاملة ✅', 'success');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      triggerToast(Array.isArray(msg) ? msg[0] : msg || 'حدث خطأ', 'error');
    },
  });
};