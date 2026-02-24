import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next) // ⚠️ السطر ده هو اللي بيربطها بـ React
  .init({
    fallbackLng: 'ar',
    ns: ['navigation', 'dashboard', 'roles', 'auth', 'common'], 
    defaultNS: 'navigation',
    interpolation: { escapeValue: false },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // مسار البحث عن الملفات
    }
  });

export default i18n;