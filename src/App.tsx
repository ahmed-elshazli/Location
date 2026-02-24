import { Suspense, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useConfigStore } from './store/useConfigStore'; // استيراد مخزن الإعدادات
import { router } from './routes';
import './global.css';

// 1. إعداد Query Client لإدارة الكاش بجودة احترافية
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // لضمان عدم استهلاك موارد الجهاز على أوبونتو بدون داعي
      retry: 1, 
      staleTime: 5 * 60 * 1000, // البيانات تظل "طازجة" لمدة 5 دقائق
    },
  },
});

function App() {
  // 2. جلب حالة اللغة والاتجاه من Zustand
  const { dir, lang } = useConfigStore();

  // 3. مزامنة حالة السيستم مع الـ DOM فور تشغيل التطبيق
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [dir, lang]);

  return (
    <QueryClientProvider client={queryClient}>
      
      {/* 4. Suspense للتعامل مع تحميل الميزات بنظام Lazy Loading */}
      <Suspense 
        fallback={
          <div className="flex items-center justify-center h-screen bg-[#FAFAFA]">
            <div className="text-[#B5752A] font-bold animate-pulse">
              {lang === 'ar' ? 'جاري تحميل النظام...' : 'Loading System...'}
            </div>
          </div>
        }
      >
        
        {/* 5. تفعيل الراوتر الرئيسي للسيستم */}
        <RouterProvider router={router} />
        
      </Suspense>

    </QueryClientProvider>
  );
}

export default App;