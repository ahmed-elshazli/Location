import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../store/useConfigStore';
import Container from '../../imports/Container';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { Shield, Plus } from 'lucide-react'; // أيقونات للتوست

// ✅ استيراد الهوك الجديد
import { useLogin } from '../auth/hooks/useLogin'; 

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // حالة التوست للخطأ
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: '' });

  const { t } = useTranslation('auth');
  const { dir } = useConfigStore(); 
  const isRTL = dir === 'rtl';

  // ✅ استخدام هوك اللوجين الجديد
  const { mutate: login, isPending } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // نبعت البيانات للباك إيند مباشرة
    login({ email, password }, {
      onError: (error: any) => {
        // إظهار التوست في حالة فشل اللوجين
        const errorMsg = error.response?.data?.message || "Invalid credentials";
        setToast({ show: true, msg: Array.isArray(errorMsg) ? errorMsg[0] : errorMsg });
        setTimeout(() => setToast({ show: false, msg: '' }), 4000);
      }
    });
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
      {toast.show && (
        <div className={`fixed bottom-10 ${isRTL ? 'left-10' : 'right-10'} z-[100] animate-in slide-in-from-bottom-5 duration-300`}>
          <div className="bg-white border-r-4 border-red-600 shadow-2xl rounded-xl p-4 flex items-center gap-4 min-w-[300px]">
            <div className="bg-red-100 p-2 rounded-full">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <h4 className="text-[#16100A] font-bold text-sm">{t('common:error')}</h4>
              <p className="text-[#555555] text-xs">{toast.msg}</p>
            </div>
            <button onClick={() => setToast({ show: false, msg: '' })} className="ms-auto p-1 hover:bg-gray-100 rounded-full">
              <Plus className="w-4 h-4 rotate-45 text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}