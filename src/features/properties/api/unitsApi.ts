import { api } from '../../../utils/axios';

// إنشاء وحدة جديدة مربوطة بمشروع
// تحديث الدالة لتبعت البيانات كـ multipart/form-data
export const createUnitApi = async (formData: FormData) => {
  const response = await api.post('/api/v1/units', formData, {
    headers: {
      // ✅ إخبار السيرفر إن فيه ملفات مبعوثة
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
// جلب جميع الوحدات من قاعدة البيانات
// جلب جميع الوحدات من قاعدة البيانات
export const getAllUnitsApi = async (page: number = 1) => {
  const response = await api.get('/api/v1/units/all', {
    params: { page, limit: 10 },
  });
  return response.data;
};

// تحديث بيانات وحدة موجودة
// تحديث دالة التعديل لتدعم رفع الملفات (Images)
export const updateUnitApi = async ({ id, data }: { id: string; data: FormData }) => {
  const response = await api.patch(`/api/v1/units/${id}`, data, {
    headers: {
      // ✅ إخبار السيرفر أن الطلب يحتوي على ملفات ونصوص مختلطة
      'Content-Type': 'multipart/form-data',
    },
  });
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

export const getAllUnitsWithoutPaginationApi = async () => {
  const response = await api.get('/api/v1/units/all');
  return response.data;
};