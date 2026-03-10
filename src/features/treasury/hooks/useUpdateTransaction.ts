import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTransactionApi, CreateTransactionPayload } from '../api/treasuryApi';
import { useToastStore } from '../../../store/useToastStore';

export const useUpdateTransaction = () => {
  const queryClient  = useQueryClient();
  const { triggerToast } = useToastStore();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateTransactionPayload> }) =>
      updateTransactionApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-stats'] });
      triggerToast('تم تحديث المعاملة ✅', 'success');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      triggerToast(Array.isArray(msg) ? msg[0] : msg || 'حدث خطأ', 'error');
    },
  });
};