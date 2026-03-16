import { api } from '../../../utils/axios';

export interface FetchDevelopersParams {
  page?: number;
  limit?: number;
  keyword?: string;
}

export const fetchDevelopers = async (params: FetchDevelopersParams = {}) => {
  const { page = 1, limit = 100, keyword } = params;
  const query: Record<string, any> = { page, limit };
  if (keyword) query.keyword = keyword;
  const response = await api.get('/api/v1/developers', { params: query });
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
  const response = await api.post('/api/v1/developers', data);
  return response.data;
};

export interface DevelopersSummary {
  totalDevelopers: number;
  totalProjects: number;
  totalUnits: number;
}

export const fetchDevelopersSummary = async (): Promise<DevelopersSummary> => {
  const response = await api.get('/api/v1/developers/summary');
  return response.data?.data || response.data;
};

export interface IndividualDevSummary {
  projectsCount: number;
  totalUnitsSold: number;
  revenue: number;
}

export const fetchIndividualDevSummary = async (id: string): Promise<IndividualDevSummary> => {
  const response = await api.get(`/api/v1/developers/${id}/summary`);
  return response.data?.data || response.data;
};

export const getDeveloperByIdApi = async (id: string) => {
  const response = await api.get(`/api/v1/developers/${id}`);
  return response.data?.data || response.data;
};

export const updateDeveloperApi = async (id: string, data: any) => {
  const response = await api.patch(`/api/v1/developers/${id}`, data);
  return response.data;
};

export const deleteDeveloperApi = async (id: string) => {
  const response = await api.delete(`/api/v1/developers/${id}`);
  return response.data;
};