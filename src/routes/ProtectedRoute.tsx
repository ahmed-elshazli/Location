// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export const ProtectedRoute = () => {
  const { token } = useAuthStore();

  // لو مفيش توكن (يعني لسه ممعملش Login)، ابعته لصفحة اللوجن
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // لو فيه توكن، خليه يشوف محتوى السيستم
  return <Outlet />;
};