import { api } from "../../../utils/axios";

// جلب قائمة الصفقات
export const getAllDealsApi = async (page: number = 1) => {
  const response = await api.get('/api/v1/deals', {
    params: { page, limit: 10 },
  });
  return response.data;
};

// إضافة صفقة جديدة
export const createDealApi = async (data: any) => {
  const response = await api.post('/api/v1/deals', data);
  return response.data;
};

// تحديث كل بيانات الصفقة — PATCH /api/v1/deals/{id}
export const updateDealApi = async ({ id, data }: { id: string; data: any }) => {
  const response = await api.patch(`/api/v1/deals/${id}`, data);
  return response.data;
};

// تحديث حالة الصفقة فقط — PATCH /api/v1/deals/{id}/status
export const updateDealStatusApi = async ({ id, status }: { id: string; status: string }) => {
  const response = await api.patch(`/api/v1/deals/${id}/status`, { status });
  return response.data;
};

export const getPipelineSummaryApi = async () => {
  const response = await api.get('/api/v1/deals/pipeline/summary');
  return response.data;
};

// حذف صفقة
export const deleteDealApi = async (id: string) => {
  const response = await api.delete(`/api/v1/deals/${id}`);
  return response.data;
};

export const getDealByIdApi = async (id: string) => {
  const response = await api.get(`/api/v1/deals/${id}`);
  return response.data;
};
 