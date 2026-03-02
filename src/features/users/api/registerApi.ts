import { api } from '../../../utils/axios'; // بنستخدم النسخة اللي فيها الـ Interceptors
import { RegisterPayload, RegisterResponse } from '../types';

export const registerUserApi = async (userData: RegisterPayload): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>('/api/v1/auth/register', userData);
  return response.data;
};