import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'sales' | 'user';
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean; // ✅ حقل جديد لمعرفة هل انتهى التحميل أم لا
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void; // ✅ لتحديث حالة التحميل
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      _hasHydrated: false, // القيمة الافتراضية
      
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      
      clearAuth: () => set({ token: null, user: null, isAuthenticated: false }),
      
      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
        // يمكنك هنا إضافة حذف أي بيانات أخرى من الـ Store
      },

      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'auth-storage',
      // ✅ هذه الدالة تُستدعى تلقائياً عند بدء تحميل البيانات من localStorage
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);