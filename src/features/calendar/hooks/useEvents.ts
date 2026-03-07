import { useQuery } from '@tanstack/react-query';
import { getEventsApi } from '../api/eventsApi';

export const useEvents = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['events', page, limit],
    queryFn: () => getEventsApi(page, limit),
    placeholderData: (prev) => prev,
  });
};