import { api } from '../../../utils/axios';

export const loginApi = async (credentials: any) => {
  // console.log('loginApi called', credentials); // ✅
  const response = await api.post('/api/v1/auth/login', credentials);
  return response.data;
};
export const logoutApi = async (userId: string) => {
  // بنبعت طلب للسيرفر عشان يقفل الجلسة برقم الـ ID
  return await api.post(`/api/v1/auth/logout/${userId}`);
};