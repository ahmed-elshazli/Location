import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerUserApi } from '../api/registerApi';

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerUserApi,
    onSuccess: (data) => {
      // تحديث الكاش الخاص بالمستخدمين بعد التسجيل الناجح
      queryClient.invalidateQueries({ queryKey: ['users'] });
      console.log("Registration Successful in Cache:", data);
    },
    onError: (error: any) => {
      console.error("Hook Error Handling:", error.response?.data?.message);
    }
  });
};