import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // مكتبة الترجمة
import { useConfigStore } from '../store/useConfigStore'; // مخزن الإعدادات

export function LanguageSwitcher() {
  const { i18n } = useTranslation(); // الوصول لخصائص المترجم
  const { lang, setLanguage, dir } = useConfigStore(); // جلب الحالة من Zustand

  const isRTL = dir === 'rtl'; // تحديد الاتجاه بناءً على Zustand

  const toggleLanguage = () => {
    // تبديل اللغة والاتجاه في خطوة واحدة عبر الـ Store
    const newLang = lang === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#E5E5E5] hover:bg-[#F7F7F7] transition-colors w-full justify-center ${
        isRTL ? 'flex-row-reverse' : 'flex-row'
      }`}
      // استخدام نصوص توضيحية بناءً على اللغة الحالية
      title={lang === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
    >
      <Languages className="w-4 h-4 text-[#555555]" />
      <span className="text-sm font-medium text-[#555555]">
        {lang === 'en' ? 'العربية' : 'English'}
      </span>
    </button>
  );
}