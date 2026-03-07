import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../store/useConfigStore';
import Container from '../../imports/Container';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { AlertCircle } from 'lucide-react';
import { useLogin } from '../auth/hooks/useLogin';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router';

export function Login() {
  const [email, setEmail]   = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { t }    = useTranslation('auth');
  const { dir }  = useConfigStore();
  const isRTL    = dir === 'rtl';

  const { mutate: login, isPending } = useLogin();

    const navigate = useNavigate();

    const { isAuthenticated } = useAuthStore();

useEffect(() => {
  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
  }
}, [isAuthenticated, navigate]); // إضافة التبعات لضمان التحديث

const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(''); // مسح الخطأ القديم

    // ✅ التنفيذ المباشر
    login({ email, password }, {
      onSuccess: () => {
        // النجاح هيحدث الـ Store والـ AppRoutes هيحس بالتغيير ويوديك الداشبورد
        // أو تقدر تعمل navigate يدوياً هنا للتأكيد
        navigate('/dashboard', { replace: true });
      },
      onError: (error: any) => {
        // ✅ لو البيانات غلط، هيفضل هنا ويظهر الرسالة بس من غير ريلود
        const msg = error.response?.data?.message || 'بيانات الدخول غير صحيحة';
        setErrorMsg(Array.isArray(msg) ? msg[0] : msg);
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]" dir={dir}>

      {/* Language Switcher */}
      <div className={`fixed top-6 ${isRTL ? 'left-6' : 'right-6'} z-10`}>
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md px-4">
        <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-8">

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <Container />
            </div>
            <h1 className="text-2xl font-bold text-[#16100A] mb-2">{t('login.title')}</h1>
            <p className="text-[#555555]">{t('login.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">

              {/* Email */}
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <label htmlFor="email" className="block text-sm font-medium text-[#16100A] mb-2">
                  {t('login.email')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrorMsg(''); }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] focus:border-transparent transition-colors ${
                    errorMsg ? 'border-red-300 bg-red-50' : 'border-[#E5E5E5]'
                  } ${isRTL ? 'text-right' : 'text-left'}`}
                  placeholder={t('login.emailPlaceholder')}
                  required
                />
              </div>

              {/* Password */}
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <label htmlFor="password" className="block text-sm font-medium text-[#16100A] mb-2">
                  {t('login.password')}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrorMsg(''); }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] focus:border-transparent transition-colors ${
                    errorMsg ? 'border-red-300 bg-red-50' : 'border-[#E5E5E5]'
                  } ${isRTL ? 'text-right' : 'text-left'}`}
                  placeholder={t('login.passwordPlaceholder')}
                  required
                />
              </div>

              {/* ✅ Error Message - تحت الباسوورد مباشرة */}
              {errorMsg && (
                <div className={`flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className={`text-sm text-red-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {errorMsg}
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full gradient-primary text-white font-medium py-3 px-4 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 mt-2"
              >
                {isPending
                  ? (isRTL ? 'جارٍ تسجيل الدخول...' : 'Signing in...')
                  : t('login.signIn')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}