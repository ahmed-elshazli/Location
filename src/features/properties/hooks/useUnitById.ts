import { useQuery } from '@tanstack/react-query';
import { getUnitByIdApi } from '../api/unitsApi';

export const useUnitById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['unit', id],
    queryFn: () => getUnitByIdApi(id!),
    enabled: !!id,
  });
};