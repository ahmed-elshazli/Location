import { useMutation, useQueryClient } from '@tanstack/react-query';
import { changeUserPasswordApi } from '../api/usersApi';
import { useToastStore } from '../../../store/useToastStore';

export const useChangeUserPassword = () => {
  const queryClient      = useQueryClient();
  const { triggerToast } = useToastStore();

  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      changeUserPasswordApi(id, password),
    onSuccess: () => {
      triggerToast('تم تغيير كلمة المرور بنجاح ✅', 'success');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      triggerToast(Array.isArray(msg) ? msg[0] : msg || 'فشل تغيير كلمة المرور', 'error');
    },
  });
};