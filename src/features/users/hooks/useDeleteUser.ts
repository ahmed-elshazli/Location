import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteUser } from '../api/usersApi';

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      // ✅ تحديث قائمة المستخدمين فوراً بعد الحذف
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};