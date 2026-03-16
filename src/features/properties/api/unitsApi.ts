import { api } from '../../../utils/axios';

export interface FetchUnitsParams {
  page?: number;
  keyword?: string;
  type?: string;
  purpose?: string;
  area?: string;
  status?: string;
}

export const createUnitApi = async (formData: FormData) => {
  const response = await api.post('/api/v1/units', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getAllUnitsApi = async (params: FetchUnitsParams = {}) => {
  const { page = 1, keyword, type, purpose, area, status } = params;
  const query: Record<string, any> = { page, limit: 10 };
  if (keyword) query.keyword = keyword;
  if (type    && type    !== 'all') query.type    = type;
  if (purpose && purpose !== 'all') query.purpose = purpose;
  if (area    && area    !== 'all') query.area    = area;
  if (status  && status  !== 'all') query.status  = status;
  const response = await api.get('/api/v1/units/all', { params: query });
  return response.data;
};

export const updateUnitApi = async ({ id, data }: { id: string; data: FormData }) => {
  const response = await api.patch(`/api/v1/units/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteUnitApi = async (id: string) => {
  const response = await api.delete(`/api/v1/units/${id}`);
  return response.data;
};

export const sellUnitApi = async (id: string) => {
  const response = await api.patch(`/api/v1/units/${id}/sell`);
  return response.data;
};

export const getAllUnitsWithoutPaginationApi = async () => {
  const response = await api.get('/api/v1/units/all');
  return response.data;
};

export const getUnitByIdApi = async (id: string) => {
  const response = await api.get(`/api/v1/units/${id}`);
  return response.data;
};