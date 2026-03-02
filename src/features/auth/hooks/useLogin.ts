import { useMutation } from '@tanstack/react-query';
import { loginApi } from '../api/loginApi';
import { useAuthStore } from '../../../store/useAuthStore'; // الستور اللي عملناه
import { useNavigate } from 'react-router-dom';

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (response) => {
      // 1. حفظ التوكن وبيانات المستخدم في Zustand (واللي بيحفظها أوتوماتيك في الـ LocalStorage)
     const token = response.accessToken; 

  if (token) {
    // 2. تحويل البيانات لشكل الـ User Interface اللي مشروعك مستنيه
    const mappedUser = {
      id: response.id,
      name: response.fullName, // تحويل fullName إلى name عشان يظهر في Layout.tsx
      email: response.email,
      role: response.role, // admin
    };

    // 3. تخزين البيانات كاملة في الـ Store
    setAuth(token, mappedUser); 
    
    console.log("✅ تم الحفظ بنجاح، أهلاً بك يا:", mappedUser.name);
    
    // 4. التوجه للداشبورد
    navigate('/dashboard');
  } else {
    console.error("❌ فشل العثور على accessToken في الرد!");
  }
    },
    onError: (error: any) => {
      console.error("❌ فشل اللوجين:", error.response?.data?.message || "Invalid credentials");
    }
  });
};