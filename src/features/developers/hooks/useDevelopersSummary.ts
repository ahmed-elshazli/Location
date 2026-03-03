// src/features/developers/hooks/useDevelopersSummary.ts
import { useQuery } from '@tanstack/react-query';
import { fetchDevelopersSummary } from '../api/developersApi';

export const useDevelopersSummary = () => {
  return useQuery({
    queryKey: ['developers-summary'],
    queryFn: fetchDevelopersSummary,
    staleTime: 5 * 60 * 1000, // البيانات صالحة لمدة 5 دقائق
  });
};