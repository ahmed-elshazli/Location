import { useQuery } from '@tanstack/react-query';
import { fetchIndividualDevSummary } from '../api/developersApi';

export const useIndividualDevSummary = (id: string) => {
  return useQuery({
    // المفتاح لازم يتضمن الـ ID عشان الكاش ميتلخبطش بين المطورين
    queryKey: ['developer-summary', id], 
    queryFn: () => fetchIndividualDevSummary(id),
    enabled: !!id, // ميبدأش الطلب إلا لو الـ ID موجود فعلاً
    staleTime: 5 * 60 * 1000, // البيانات صالحة لـ 5 دقائق
  });
};