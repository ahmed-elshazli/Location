/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // أضف أي متغيرات أخرى هنا مستقبلاً
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}