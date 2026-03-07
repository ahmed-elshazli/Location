import { useQuery } from '@tanstack/react-query';
import { getAllUnitsApi } from '../api/unitsApi';

export const useUnits = (page: number = 1) => {
  return useQuery({
    queryKey: ['units', page],
    queryFn: () => getAllUnitsApi(page),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
};