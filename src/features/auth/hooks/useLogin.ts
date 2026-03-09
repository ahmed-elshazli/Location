import { useMutation } from '@tanstack/react-query';
import { loginApi } from '../api/loginApi';
import { useAuthStore } from '../../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (response) => {
      const token = response.accessToken;
      if (!token) return;
      setAuth(token, {
        id:    response.id,
        name:  response.fullName,
        email: response.email,
        role:  response.role,
      });
      navigate('/dashboard', { replace: true });
    },
  });
};