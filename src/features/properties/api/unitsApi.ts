import { api } from '../../../utils/axios';

// إنشاء وحدة جديدة مربوطة بمشروع
export const createUnitApi = async (formData: FormData) => {
  // سيب Axios يحدد الـ Boundary أوتوماتيك
  const response = await api.post('/api/v1/units', formData);
  return response.data;
};

// جلب جميع الوحدات من قاعدة البيانات
export const getAllUnitsApi = async () => {
  const response = await api.get('/api/v1/units/all');
  // السيرفر غالباً بيرجع مصفوفة (Array) من الوحدات داخل كائن
  return response.data; 
};

// تحديث بيانات وحدة موجودة
export const updateUnitApi = async ({ id, data }: { id: string; data: FormData }) => {
  // ✅ إرسال PATCH بالـ ID والـ FormData
  const response = await api.patch(`/api/v1/units/${id}`, data);
  return response.data;
};

// حذف وحدة معينة باستخدام المعرف الفريد (ID)
export const deleteUnitApi = async (id: string) => {
  const response = await api.delete(`/api/v1/units/${id}`);
  return response.data;
};

// تحويل حالة الوحدة إلى "مباعة"
export const sellUnitApi = async (id: string) => {
  const response = await api.patch(`/api/v1/units/${id}/sell`);
  return response.data;
};