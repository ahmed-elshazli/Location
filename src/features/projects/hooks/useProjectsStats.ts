import { useQuery } from '@tanstack/react-query';
import { getProjectsStatsApi } from '../api/projectsApi';

export const useProjectsStats = () => {
  return useQuery({
    queryKey: ['projects-stats'], // مفتاح فريد للكاش
    queryFn: getProjectsStatsApi,
    staleTime: 2 * 60 * 1000, // البيانات تعتبر حديثة لمدة دقيقتين
  });
};