// src/features/areas/hooks/useAreas.ts
import { useQuery } from '@tanstack/react-query';
import { getAreasApi } from '../api/areasApi';

export const useAreas = (page: number = 1, limit: number = 9) => {
  return useQuery({
    queryKey: ['areas', page, limit],
    queryFn: () => getAreasApi({ page, limit }),
    placeholderData: (prev) => prev, // ✅ يحتفظ بالداتا القديمة لحد ما الجديدة تيجي
  });
};