import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../i18n'; // ⚠️ استورد من ملفك الشخصي i18n.ts وليس من 'i18next'

interface ConfigState {
  lang: 'en' | 'ar';
  dir: 'ltr' | 'rtl';
  setLanguage: (lang: 'en' | 'ar') => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      lang: 'ar',
      dir: 'rtl',
      setLanguage: (lang) => {
        const dir = lang === 'ar' ? 'rtl' : 'ltr';
        
        // تغيير اللغة والاتجاه
        i18n.changeLanguage(lang);
        document.documentElement.dir = dir;
        document.documentElement.lang = lang;

        set({ lang, dir });
      },
    }),
    { name: 'config-storage' }
  )
);