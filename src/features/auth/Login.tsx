import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. استيراد الهوك الخاص بالتنقل
import { useTranslation } from 'react-i18next'; // نظام الترجمة الجديد
import { useAuthStore } from '../../store/useAuthStore'; // 2. استيراد مخزن الحماية
import { useConfigStore } from '../../store/useConfigStore'; // مخزن الإعدادات
import Container from '../../imports/Container';

import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { User } from '../../types/auth';

// البيانات التجريبية
const mockUsers = [
  { id: '1', name: 'Super Admin', email: 'superadmin@locationproperties.com', role: 'super_admin' },
  { id: '2', name: 'Noha', email: 'noha@locationproperties.com', role: 'admin' },
  { id: '3', name: 'Elbaze', email: 'elbaze@locationproperties.com', role: 'admin' },
  { id: '4', name: 'Abdallah', email: 'abdallah@locationproperties.com', role: 'sales' },
  { id: '5', name: 'Esmaeil', email: 'esmaeil@locationproperties.com', role: 'sales' },
  { id: '6', name: 'Raghad', email: 'raghad@locationproperties.com', role: 'sales' },
];

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // 3. تعريف الهوكس الجديدة
  const { t } = useTranslation('auth');
  const navigate = useNavigate(); // هوك التنقل
  const { dir } = useConfigStore(); 
  const { setAuth } = useAuthStore(); // دالة تحديث حالة الدخول في Zustand
  
  const isRTL = dir === 'rtl';

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  // 1. البحث عن المستخدم بالإيميل
  const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  // 2. التحقق من الباسورد الموحد
  if (foundUser && password === 'demo123') {
    // 3. تسجيل البيانات في Zustand
    // سيتم تخزين الـ role تلقائياً (super_admin, admin, sales)
    setAuth('fake-token-123', foundUser as User); 
    
    // 4. التوجه للداشبورد (الـ Layout هيتولى إظهار الخيارات بناءً على الـ Role)
    navigate('/dashboard'); 
  } else {
    setError(t('login.error') || 'Invalid email or password');
  }
};

  

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]" dir={dir}>
      <div className={`fixed top-6 ${isRTL ? 'left-6' : 'right-6'} z-10`}>
        <LanguageSwitcher />
      </div>


      <div className="w-full max-w-md px-4">
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <Container />
            </div>
            <h1 className="text-2xl font-bold text-[#16100A] mb-2">{t('login.title')}</h1>
            <p className="text-[#555555]">{t('login.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <label htmlFor="email" className="block text-sm font-medium text-[#16100A] mb-2">
                  {t('login.email')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] focus:border-transparent ${isRTL ? 'text-right' : 'text-left'}`}
                  placeholder={t('login.emailPlaceholder')}
                  required
                />
              </div>

              <div className={isRTL ? 'text-right' : 'text-left'}>
                <label htmlFor="password" className="block text-sm font-medium text-[#16100A] mb-2">
                  {t('login.password')}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] focus:border-transparent ${isRTL ? 'text-right' : 'text-left'}`}
                  placeholder={t('login.passwordPlaceholder')}
                  required
                />
              </div>

              {error && (
                <div className={`bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full gradient-primary text-white font-medium py-3 px-4 rounded-lg hover:opacity-90 transition-all"
              >
                {t('login.signIn')}
              </button>
            </div>
          </form>

          {/* قسم البيانات التجريبية */}
          <div className="mt-6 pt-6 border-t border-[#E5E5E5]">
            <p className={`text-xs text-[#555555] mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>{t('login.demoCredentials')}</p>
            <div className="space-y-2 text-xs text-[#555555]">
              <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="font-medium">{t('login.superAdmin')}</span>
                <span className="text-left" dir="ltr">superadmin@locationproperties.com</span>
              </div>
              <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="font-medium">{t('login.admin')}</span>
                <span className="text-left" dir="ltr">noha@locationproperties.com</span>
              </div>
              <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="font-medium">{t('login.admin')}</span>
                <span className="text-left" dir="ltr">elbaze@locationproperties.com</span>
              </div>
              <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="font-medium">{t('login.sales')}</span>
                <span className="text-left" dir="ltr">abdallah@locationproperties.com</span>
              </div>
              <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="font-medium">{t('login.sales')}</span>
                <span className="text-left" dir="ltr">esmaeil@locationproperties.com</span>
              </div>
              <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="font-medium">{t('login.sales')}</span>
                <span className="text-left" dir="ltr">raghad@locationproperties.com</span>
              </div>
              <div className="text-center mt-2 pt-2 border-t border-[#E5E5E5]">
                <span className="font-medium">{t('login.passwordForAll')}</span> <span dir="ltr">demo123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}