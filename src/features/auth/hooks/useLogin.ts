import { useMutation } from '@tanstack/react-query';
import { loginApi } from '../api/loginApi';
import { useAuthStore } from '../../../store/useAuthStore';

// useLogin.ts
export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (response) => {
      // ✅ التعديل هنا: السيرفر بيبعت accessToken مش token
      const token = response.accessToken; 
      
      if (!token) {
        console.error("لم يتم العثور على accessToken في رد السيرفر");
        return;
      }

      // ✅ التعديل هنا: البيانات جاية مباشرة في الـ response مش جوه كائن user
      setAuth(token, {
        id:    response.id,
        name:  response.fullName, // السيرفر بيبعت fullName مش name
        email: response.email,
        role:  response.role,
      });
    },
  });
};