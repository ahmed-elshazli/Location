import { api } from '../../../utils/axios';

export interface FetchProjectsParams {
  page?: number;
  limit?: number;
  keyword?: string;
  status?: string;
}

export const createProjectApi = async (formData: FormData) => {
  const response = await api.post('/api/v1/projects', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getProjectsApi = async (params: FetchProjectsParams = {}) => {
  const { page = 1, limit = 6, keyword, status } = params;
  const query: Record<string, any> = { page, limit };
  if (keyword) query.keyword = keyword;
  if (status && status !== 'all') query.status = status; // send as-is (e.g. 'Active', 'Inactive')
  const response = await api.get('/api/v1/projects', { params: query });
  return response.data;
};

export const getProjectByIdApi = async (id: string) => {
  const response = await api.get(`/api/v1/projects/${id}`);
  return response.data;
};

export const getProjectsStatsApi = async () => {
  const response = await api.get('/api/v1/projects/stats');
  return response.data;
};

export const getProjectSummaryApi = async (id: string) => {
  const response = await api.get(`/api/v1/projects/summary/${id}`);
  return response.data;
};

export const updateProjectApi = async ({ id, data }: { id: string; data: FormData }) => {
  const response = await api.patch(`/api/v1/projects/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteProjectApi = async (id: string) => {
  const response = await api.delete(`/api/v1/projects/${id}`);
  return response.data;
};