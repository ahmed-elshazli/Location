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
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { t }   = useTranslation('auth');
  const { dir } = useConfigStore();
  const isRTL   = dir === 'rtl';

  const { mutate: login, isPending } = useLogin();
  const navigate = useNavigate();
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [_hasHydrated, isAuthenticated]);

  const handleSubmit = () => {
    setErrorMsg('');
    login({ email, password }, {
      onError: (error: any) => {
        const msg = error.response?.data?.message || 'Invalid email or password';
        setErrorMsg(Array.isArray(msg) ? msg[0] : msg);
        setTimeout(() => setErrorMsg(''), 4000);
      },
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

          <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <label htmlFor="email" className="block text-sm font-medium text-[#16100A] mb-2">
                {t('login.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrorMsg(''); }}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] transition-colors ${
                  errorMsg ? 'border-red-300 bg-red-50' : 'border-[#E5E5E5]'
                } ${isRTL ? 'text-right' : 'text-left'}`}
                placeholder={t('login.emailPlaceholder')}
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
                onChange={e => { setPassword(e.target.value); setErrorMsg(''); }}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] transition-colors ${
                  errorMsg ? 'border-red-300 bg-red-50' : 'border-[#E5E5E5]'
                } ${isRTL ? 'text-right' : 'text-left'}`}
                placeholder={t('login.passwordPlaceholder')}
              />
            </div>

            {errorMsg && (
              <div className={`flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className={`text-sm text-red-600 ${isRTL ? 'text-right' : 'text-left'}`}>{errorMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full gradient-primary text-white font-medium py-3 px-4 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 mt-2"
            >
              {isPending ? (isRTL ? 'جارٍ تسجيل الدخول...' : 'Signing in...') : t('login.signIn')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}