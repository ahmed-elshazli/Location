import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const { token, user } = useAuthStore.getState();
    const tenantId = (user as any)?.tenant_id;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (tenantId) {
      config.headers['X-Tenant-ID'] = String(tenantId);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    // ✅ لو 401 وبس مش في صفحة اللوجين — اعمل logout بدون reload
    if (error.response?.status === 401 && !isLoginRequest) {
      useAuthStore.getState().logout();
      // استخدم history بدل window.location عشان نتجنب الـ reload
      window.history.pushState({}, '', '/login');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }

    return Promise.reject(error);
  }
);

export { api };