import { useQuery } from '@tanstack/react-query';
import { getAllUnitsApi, FetchUnitsParams } from '../api/unitsApi';

export const useUnits = (params: FetchUnitsParams = {}) => {
  return useQuery({
    queryKey: ['units', params],
    queryFn: () => getAllUnitsApi(params),
    staleTime: 0,
    placeholderData: (prev) => prev,
  });
};