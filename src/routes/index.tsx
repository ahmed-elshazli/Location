import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppRoutes } from './AppRoutes';
import { Login } from '../features/auth/Login';
import { useAuthStore } from '../store/useAuthStore'; //

// مكون بسيط للتحويل التلقائي عند فتح الرابط الافتراضي
const RootRedirect = () => {
  const { isAuthenticated } = useAuthStore(); //
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />, // اللوجن هو المسار الافتراضي
  },
  {
    // كل المسارات المحمية تبدأ من هنا
    element: <ProtectedRoute />, 
    children: [
      {
        path: '/*', 
        element: <AppRoutes />, // المسارات الداخلية (السايد بار)
      },
    ],
  },
  {
    path: '*',
    element: <div className="p-10 text-center">404 - الصفحة غير موجودة</div>,
  },
]);