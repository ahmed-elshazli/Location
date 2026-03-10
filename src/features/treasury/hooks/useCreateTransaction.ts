import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTransactionApi, CreateTransactionPayload } from '../api/treasuryApi';
import { useToastStore } from '../../../store/useToastStore';

export const useCreateTransaction = () => {
  const queryClient  = useQueryClient();
  const { triggerToast } = useToastStore();

  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) => createTransactionApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-stats'] });
      triggerToast('تمت إضافة المعاملة ✅', 'success');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      triggerToast(Array.isArray(msg) ? msg[0] : msg || 'حدث خطأ', 'error');
    },
  });
};