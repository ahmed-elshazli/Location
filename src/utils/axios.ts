import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore'; // تأكد من المسار

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Request Interceptor: لإضافة البيانات قبل كل طلب
api.interceptors.request.use(
  (config) => {
    const { token, user } = useAuthStore.getState();
    const tenantId = (user as any)?.tenant_id;

    // إضافة توكن الحماية
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // إضافة الـ Tenant ID لضمان عزل البيانات (Multi-tenancy)
    if (tenantId) {
      config.headers['X-Tenant-ID'] = String(tenantId);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor: لمعالجة الأخطاء العالمية (Global Error Handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // لو التوكن غير صالح أو انتهى، اعمل Logout أوتوماتيك
    if (error.response?.status === 401) {
      useAuthStore.getState().logout(); // تأكد من وجود دالة logout في الـ Store
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { api };