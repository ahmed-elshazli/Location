import { useQuery } from '@tanstack/react-query';
import { getProjectsApi } from '../api/projectsApi';

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'], // الكود التعريفي للبيانات في الكاش
    queryFn: getProjectsApi,
    staleTime: 5 * 60 * 1000, // البيانات تظل "طازجة" لمدة 5 دقائق
  });
};