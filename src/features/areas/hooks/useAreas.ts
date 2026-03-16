import { useQuery } from '@tanstack/react-query';
import { getAreasApi, FetchAreasParams } from '../api/areasApi';

export const useAreas = (params: FetchAreasParams = {}) => {
  return useQuery({
    queryKey: ['areas', params],
    queryFn: () => getAreasApi(params),
    staleTime: 0,
    placeholderData: (prev) => prev,
  });
};