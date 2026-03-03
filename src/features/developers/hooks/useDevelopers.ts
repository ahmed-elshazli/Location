import { useQuery } from '@tanstack/react-query';
import { fetchDevelopers } from '../api/developersApi';

export const useDevelopers = () => {
  return useQuery({
    queryKey: ['developers'], // مفتاح الكاش
    queryFn: fetchDevelopers,
    staleTime: 10 * 60 * 1000, // البيانات تفضل "فريش" لمدة 10 دقائق
  });
};