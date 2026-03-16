import { useQuery } from '@tanstack/react-query';
import { getProjectsApi, FetchProjectsParams } from '../api/projectsApi';

export const useProjects = (params: FetchProjectsParams = {}) => {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => getProjectsApi(params),
    staleTime: 0,
    placeholderData: (prev) => prev,
  });
};