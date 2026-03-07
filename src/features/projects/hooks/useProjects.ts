import { useQuery } from '@tanstack/react-query';
import { getProjectsApi } from '../api/projectsApi';

export const useProjects = (page: number = 1, limit: number = 6) => {
  return useQuery({
    queryKey: ['projects', page, limit],
    queryFn: () => getProjectsApi(page, limit),
    placeholderData: (prev) => prev, // يخلي البيانات القديمة ظاهرة أثناء الـ fetch
  });
};