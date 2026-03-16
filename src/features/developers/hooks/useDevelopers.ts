import { useQuery } from '@tanstack/react-query';
import { fetchDevelopers, FetchDevelopersParams } from '../api/developersApi';

export const useDevelopers = (params: FetchDevelopersParams = {}) => {
  return useQuery({
    queryKey: ['developers', params],
    queryFn: () => fetchDevelopers(params),
    staleTime: 0,
    placeholderData: (prev) => prev,
  });
};