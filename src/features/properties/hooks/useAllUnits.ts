import { useQuery } from '@tanstack/react-query';
import { getAllUnitsWithoutPaginationApi } from '../api/unitsApi';

export const useAllUnits = () => {
  return useQuery({
    queryKey: ['units-all'],
    queryFn: getAllUnitsWithoutPaginationApi,
    staleTime: 5 * 60 * 1000,
  });
};