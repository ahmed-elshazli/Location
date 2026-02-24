import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom'; // استخدام React Router بدلاً من State
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../store/useConfigStore';
import { useAuthStore } from '../store/useAuthStore';
import { 
  LayoutDashboard, Users, Building2, UserCheck, Handshake, 
  UsersRound, Building, Briefcase, MapPin, Calendar as CalendarIcon, 
  BarChart3, Settings, LogOut, Menu, X 
} from 'lucide-react';
import Container from '../imports/Container';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

interface LayoutProps {}

export function Layout() {
const { user, clearAuth } = useAuthStore();
  const { t } = useTranslation(['navigation', 'roles']); // استخدام Namespaces الخاصة بك
  const navigate = useNavigate(); // هوك التنقل
  const { dir } = useConfigStore();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isRTL = dir === 'rtl';

  // ✅ منطق الصلاحيات المحدث (RBAC) ليطابق التصميم الجديد
  const getNavigationItems = () => {
    if (!user?.role) return [];

    const baseItems = [
      { id: 'dashboard', label: t('navigation:nav.dashboard'), icon: LayoutDashboard, path: '/dashboard' },
    ];

    if (user.role === 'super_admin') {
      return [
        ...baseItems,
        { id: 'users', label: t('navigation:nav.users'), icon: Users, path: '/users' },
        { id: 'properties', label: t('navigation:nav.properties'), icon: Building2, path: '/properties' },
        { id: 'leads', label: t('navigation:nav.leads'), icon: UserCheck, path: '/leads' },
        { id: 'deals', label: t('navigation:nav.deals'), icon: Handshake, path: '/deals' },
        { id: 'clients', label: t('navigation:nav.clients'), icon: UsersRound, path: '/clients' },
        { id: 'developers', label: t('navigation:nav.developers'), icon: Building, path: '/developers' },
        { id: 'projects', label: t('navigation:nav.projects'), icon: Briefcase, path: '/projects' },
        { id: 'areas', label: t('navigation:nav.areas'), icon: MapPin, path: '/areas' },
        { id: 'calendar', label: t('navigation:nav.calendar'), icon: CalendarIcon, path: '/calendar' },
        { id: 'reports', label: t('navigation:nav.reports'), icon: BarChart3, path: '/reports' },
        { id: 'settings', label: t('navigation:nav.systemSettings'), icon: Settings, path: '/settings' },
      ];
    }

    if (user.role === 'admin') {
      return [
        ...baseItems,
        { id: 'users', label: t('navigation:nav.users'), icon: Users, path: '/users' },
        { id: 'properties', label: t('navigation:nav.properties'), icon: Building2, path: '/properties' },
        { id: 'leads', label: t('navigation:nav.leads'), icon: UserCheck, path: '/leads' },
        { id: 'deals', label: t('navigation:nav.deals'), icon: Handshake, path: '/deals' },
        { id: 'clients', label: t('navigation:nav.clients'), icon: UsersRound, path: '/clients' },
        { id: 'developers', label: t('navigation:nav.developers'), icon: Building, path: '/developers' },
        { id: 'projects', label: t('navigation:nav.projects'), icon: Briefcase, path: '/projects' },
        { id: 'areas', label: t('navigation:nav.areas'), icon: MapPin, path: '/areas' },
        { id: 'calendar', label: t('navigation:nav.calendar'), icon: CalendarIcon, path: '/calendar' },
        { id: 'reports', label: t('navigation:nav.reports'), icon: BarChart3, path: '/reports' },
      ];
    }

    // دور المبيعات (Sales)
    return [
      ...baseItems,
      { id: 'leads', label: t('navigation:nav.leads'), icon: UserCheck, path: '/leads' },
      { id: 'deals', label: t('navigation:nav.deals'), icon: Handshake, path: '/deals' },
      { id: 'properties', label: t('navigation:nav.properties'), icon: Building2, path: '/properties' },
      { id: 'calendar', label: t('navigation:nav.calendar'), icon: CalendarIcon, path: '/calendar' },
    ];
  };

  const navigationItems = getNavigationItems();

  // منع الانهيار لحظة التحميل
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B5752A]"></div>
      </div>
    );
  }

  // دالة التعامل مع تسجيل الخروج
  const handleLogout = () => {
  // 1. مسح بيانات الجلسة من الـ Zustand Store
  clearAuth(); 

  // 2. التوجيه للمسار الرئيسي (/)
  // استخدام replace: true بيخلي المسار الحالي في المتصفح يتم استبداله
  navigate('/', { replace: true }); 
};

  return (
    <div className="flex h-screen bg-[#FAFAFA]" dir={dir}>
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-white ${isRTL ? 'border-l' : 'border-r'} border-[#E5E5E5] flex flex-col transition-all duration-300 overflow-hidden`}
      >
        <div className={`p-6 border-b border-[#E5E5E5] ${isRTL ? 'text-right' : 'text-left'}`}>
          <Container />
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => `
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isRTL ? 'text-right' : 'text-left'}
                  ${isActive ? 'gradient-primary text-white' : 'text-[#555555] hover:bg-[#F7F7F7]'}
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-[#E5E5E5]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
              {user.name.charAt(0)}
            </div>
            <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
              <p className="font-medium text-[#16100A] truncate">{user.name}</p>
              <p className="text-xs text-[#555555] capitalize">
                {t(`roles:role.${user.role.toLowerCase().replace('_', '')}`)}
              </p>
            </div>
          </div>
          <LanguageSwitcher />
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 mt-3 px-4 py-2 text-[#555555] hover:bg-[#F7F7F7] rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">{t('navigation:nav.signOut')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className={`h-16 bg-white border-b border-[#E5E5E5] flex items-center px-6 ${isRTL ? 'justify-start' : 'justify-between'}`}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-[#F7F7F7] rounded-lg">
            {sidebarOpen ? <X className="w-5 h-5 text-[#555555]" /> : <Menu className="w-5 h-5 text-[#555555]" />}
          </button>
          
          {!isRTL && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium text-[#16100A]">{user.name}</p>
                <p className="text-sm text-[#555555] capitalize">
                   {t(`roles:role.${user.role.toLowerCase().replace('_', '')}`)}
                </p>
              </div>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto bg-[#F9FAFB]">
          <Outlet /> {/* الرندرة الديناميكية للصفحات */}
        </div>
      </main>
    </div>
  );
}