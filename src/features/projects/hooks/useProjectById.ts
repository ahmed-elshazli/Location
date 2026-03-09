import { useQuery } from '@tanstack/react-query';
import { getProjectByIdApi } from '../api/projectsApi';

export const useProjectById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => getProjectByIdApi(id!),
    enabled: !!id,
    select: (data) => data?.data || data, // ✅ يتعامل مع { data: {...} } أو {...} مباشرة
  });
};