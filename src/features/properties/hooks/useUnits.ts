import { useQuery } from '@tanstack/react-query';
import { getAllUnitsApi } from '../api/unitsApi';

export const useUnits = () => {
  return useQuery({
    queryKey: ['units'], // مفتاح الكاش لسهولة الوصول للبيانات
    queryFn: getAllUnitsApi,
    staleTime: 5 * 60 * 1000, // البيانات تظل حديثة في الكاش لمدة 5 دقائق
  });
};