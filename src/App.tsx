import { Suspense, useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useConfigStore } from './store/useConfigStore';
import { router } from './routes';
import './global.css';
import { Toast } from './components/ui/Toast';
import i18n from './i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  const { dir, lang } = useConfigStore();
  // ✅ استنى لحد ما i18n يخلص تحميل
  const [i18nReady, setI18nReady] = useState(i18n.isInitialized);

  useEffect(() => {
    if (!i18n.isInitialized) {
      i18n.on('initialized', () => setI18nReady(true));
    }
  }, []);

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [dir, lang]);

  // ✅ لو i18n لسه بيحمل، اعرض loading
  if (!i18nReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FAFAFA]">
        <div className="text-[#B5752A] font-bold animate-pulse">
          {lang === 'ar' ? 'جاري تحميل النظام...' : 'Loading System...'}
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Toast />
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;