// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export const ProtectedRoute = () => {
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  // لو لسه بيحمل البيانات من الـ storage، ما تعملش Redirect
  if (!_hasHydrated) return null; 

  if (!isAuthenticated) {
    return <Navigate to="/" replace />; // ✅ العودة للـ Root وليس /login
  }

  return <Outlet />;
};