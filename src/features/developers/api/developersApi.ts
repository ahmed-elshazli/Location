import { api } from '../../../utils/axios';

export const fetchDevelopers = async () => {
  // طلب GET لجلب المطورين
  const response = await api.get('/api/v1/developers');
  // بنرجع البيانات مباشرة (تأكد لو كانت جوه .data أو مصفوفة مباشرة)
  return response.data; 
};

export interface CreateDeveloperPayload {
  name: string;
  email: string;
  description: string;
  phone: string;
  location: string;
  area: string[];
}

export const createDeveloperApi = async (data: CreateDeveloperPayload) => {
  // إرسال طلب POST للمسار المحدد
  const response = await api.post('/api/v1/developers', data);
  return response.data;
};

// src/api/developersApi.ts
export interface DevelopersSummary {
  totalDevelopers: number;
  totalProjects: number;
  totalUnits: number;
}

export const fetchDevelopersSummary = async (): Promise<DevelopersSummary> => {
  const response = await api.get('/api/v1/developers/summary');
  // تأكد إذا كانت البيانات داخل response.data مباشرة أو كائن data
  return response.data?.data || response.data; 
};

// تعريف واجهة البيانات للملخص الفردي
export interface IndividualDevSummary {
  projectsCount: number;
  totalUnitsSold: number;
  revenue: number;
}

export const fetchIndividualDevSummary = async (id: string): Promise<IndividualDevSummary> => {
  // طلب GET باستخدام الـ ID الخاص بالمطور
  const response = await api.get(`/api/v1/developers/${id}/summary`);
  return response.data?.data || response.data; // تأمين استخراج البيانات
};

export const getDeveloperByIdApi = async (id: string) => {
  const response = await api.get(`/api/v1/developers/${id}`);
  return response.data?.data || response.data;
};

// تحديث بيانات مطور (PATCH)
export const updateDeveloperApi = async (id: string, data: any) => {
  const response = await api.patch(`/api/v1/developers/${id}`, data);
  return response.data;
};

// حذف مطور نهائياً
export const deleteDeveloperApi = async (id: string) => {
  const response = await api.delete(`/api/v1/developers/${id}`);
  return response.data;
};