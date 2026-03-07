import { api } from '../../../utils/axios';

export const getEventsApi = async (page: number = 1, limit: number = 10) => {
  const response = await api.get('/api/v1/events', {
    params: { page, limit },
  });
  return response.data;
};

export const getEventByIdApi = async (id: string) => {
  const response = await api.get(`/api/v1/events/${id}`);
  return response.data?.data || response.data;
};

export const createEventApi = async (data: any) => {
  const response = await api.post('/api/v1/events', data);
  return response.data;
};

export const updateEventApi = async (id: string, data: any) => {
  const response = await api.patch(`/api/v1/events/${id}`, data);
  return response.data;
};

export const deleteEventApi = async (id: string) => {
  const response = await api.delete(`/api/v1/events/${id}`);
  return response.data;
};