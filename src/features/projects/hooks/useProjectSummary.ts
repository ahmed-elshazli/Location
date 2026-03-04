import { useQuery } from '@tanstack/react-query';
import { getProjectSummaryApi } from '../api/projectsApi';

export const useProjectSummary = (id: string) => {
  return useQuery({
    // الـ Key يتغير بتغير الـ ID لضمان دقة البيانات
    queryKey: ['project-summary', id], 
    queryFn: () => getProjectSummaryApi(id),
    enabled: !!id, // لا يتم الجلب إلا إذا كان الـ ID موجوداً
    staleTime: 3 * 60 * 1000, // البيانات صالحة لمدة 3 دقائق
  });
};