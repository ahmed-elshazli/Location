// src/hooks/useUpdateUser.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUser } from '../api/usersApi';

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      // ✅ تحديث الجدول أوتوماتيكياً بعد التعديل
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};