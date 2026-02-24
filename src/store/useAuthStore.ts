import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// تعريف شكل بيانات المستخدم بناءً على الموك داتا الخاصة بك
interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'sales';
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  // ✅ قمنا بتغيير الاسم هنا ليطابق ما تستخدمه في الـ Layout
  clearAuth: () => void; 
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, user) => set({ 
        token, 
        user, 
        isAuthenticated: true 
      }),

      // ✅ قمنا بتغيير الاسم من logout إلى clearAuth
      clearAuth: () => {
        set({ token: null, user: null, isAuthenticated: false });
        // الـ Persist middleware هيتولى مسح الـ localStorage تلقائياً
      },
    }),
    {
      name: 'auth-storage', // الاسم في الـ LocalStorage
    }
  )
);