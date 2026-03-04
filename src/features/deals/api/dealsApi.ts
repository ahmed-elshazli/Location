import { api } from "../../../utils/axios";

// جلب قائمة الصفقات (العمليات الناجحة)
export const getDealsApi = async () => {
  const response = await api.get('/api/v1/deals');
  // تأكد من شكل الـ Response (غالباً بيبقى { data: [...] })
  return response.data;
};

// إضافة صفقة جديدة
export const createDealApi = async (data: any) => {
  // بنبعت الداتا كـ JSON أو FormData حسب إعدادات الباك-إيند عندك
  const response = await api.post('/api/v1/deals', data);
  return response.data;
};

// تحديث بيانات صفقة موجودة
export const updateDealApi = async ({ id, data }: { id: string; data: any }) => {
  const response = await api.patch(`/api/v1/deals/${id}/status`, data);
  return response.data;
};

export const getPipelineSummaryApi = async () => {
  const response = await api.get('/api/v1/deals/pipeline/summary');
  return response.data; // السيرفر هيبعت أوبجكت فيه NEW: { count: 2, totalValue: 1500000 }, إلخ.
};

// حذف صفقة نهائياً
export const deleteDealApi = async (id: string) => {
  const response = await api.delete(`/api/v1/deals/${id}`);
  return response.data;
};