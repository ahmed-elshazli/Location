// src/api/projectsApi.ts
import { api } from '../../../utils/axios';

export const createProjectApi = async (formData: FormData) => {
  // ✅ القاعدة الذهبية: لا تضع { headers: { 'Content-Type': 'multipart/form-data' } }
  // سيب Axios والمتصفح يتعاملوا مع الـ FormData أوتوماتيك عشان الـ Boundary يتضبط
  const response = await api.post('/api/v1/projects', formData); 
  return response.data;
};
export const getProjectsApi = async () => {
  const response = await api.get('/api/v1/projects'); // المسار الذي ذكرته
  return response.data; // السيرفر يرجع البيانات غالباً في حقل data
};

export const getProjectsStatsApi = async () => {
  const response = await api.get('/api/v1/projects/stats');
  // السيرفر بيرجع كائن فيه (totalProjects, totalUnits, availableUnits, soldUnits)
  return response.data; 
};

// جلب ملخص مشروع معين بناءً على الـ ID
export const getProjectSummaryApi = async (id: string) => {
  // التأكد من تمرير الـ ID في المسار
  const response = await api.get(`/api/v1/projects/summary/${id}`);
  return response.data; 
};

// تحديث مشروع موجود
export const updateProjectApi = async ({ id, data }: { id: string; data: FormData }) => {
  // ✅ إرسال طلب PATCH للمسار المحدد
  const response = await api.patch(`/api/v1/projects/${id}`, data);
  return response.data;
};

// حذف مشروع نهائياً من السيرفر
export const deleteProjectApi = async (id: string) => {
  const response = await api.delete(`/api/v1/projects/${id}`);
  return response.data;
};