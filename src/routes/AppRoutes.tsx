import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../layout/Layout';
import { Login } from '../features/auth/Login';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuthStore } from '../store/useAuthStore'; //

// ✅ 1. Lazy Loading لكل الصفحات لضمان سرعة التحميل
const Dashboard = lazy(() => import('../features/dashboard/Dashboard'));
const Leads = lazy(() => import('../features/leads/Leads'));
// يمكنك ربط المسارات بنفس المكون مؤقتاً كما طلبت
const Properties = lazy(() => import('../features/properties/Properties')); 
const Calendar = lazy(() => import('../features/calendar/Calendar')); 
const UsersManagement = lazy(() => import('../features/users/UsersManagement')); 
const Clients = lazy(() => import('../features/clients/Clients')); 
const Developers = lazy(() => import('../features/developers/Developers')); 
const Projects = lazy(() => import('../features/projects/Projects')); 
const Areas = lazy(() => import('../features/areas/Areas')); 
const Reports = lazy(() => import('../features/reports/Reports')); 
const SystemSettings = lazy(() => import('../features/settings/SystemSettings')); 
const Deals = lazy(() => import('../features/deals/Deals')); 

export const AppRoutes = () => {
  const { token } = useAuthStore();
  const { isAuthenticated } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(() => useAuthStore.persist.hasHydrated());

  useEffect(() => {
    // 2. لو هو لسه مش Hydrated، بنشترك في الـ Event اللي هيعرفنا إنه خلص
    if (!isHydrated) {
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        setIsHydrated(true); // دي هتحصل "بعدين" مش بشكل متزامن، فمش هتزعل رياكت
      });
      return () => unsub();
    }
  }, [isHydrated]);

  // منع الـ Redirect الغلط وقت التحميل
  if (!isHydrated) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B5752A]"></div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B5752A]"></div>
      </div>
    }>
      <Routes>
        {/* ✅ 2. المسار الافتراضي هو صفحة اللوجن */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />

        {/* ✅ 3. المسارات المحمية داخل الـ Layout لظهار السايدبار */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout  />}>
            {/* المسارات المشتركة والمستقلة بناءً على السايدبار */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="properties" element={<Properties />} />
            
            {/* راوتس إضافية تنادي على نفس المكونات حالياً للتجربة */}
            <Route path="deals" element={<Deals />} /> 
            <Route path="users" element={<UsersManagement/>} />
            <Route path="clients" element={<Clients/>} />
            <Route path="developers" element={<Developers />} />
            <Route path="projects" element={<Projects/>} />
            <Route path="areas" element={<Areas />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<SystemSettings />} />
          </Route>
        </Route>

        {/* ✅ 4. أي مسار غير معروف يرجع للوجن أو الداشبورد */}
       <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};