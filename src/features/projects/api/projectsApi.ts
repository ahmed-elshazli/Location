import { api } from '../../../utils/axios';

export const createProjectApi = async (formData: FormData) => {
  const response = await api.post('/api/v1/projects', formData);
  return response.data;
};

export const getProjectsApi = async (page: number = 1, limit: number = 6) => {
  const response = await api.get('/api/v1/projects', {
    params: { page, limit },
  });
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
  const response = await api.patch(`/api/v1/projects/${id}`, data);
  return response.data;
};

export const deleteProjectApi = async (id: string) => {
  const response = await api.delete(`/api/v1/projects/${id}`);
  return response.data;
};