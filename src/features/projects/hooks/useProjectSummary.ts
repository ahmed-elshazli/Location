import { useQueries } from '@tanstack/react-query';
import { getProjectSummaryApi } from '../api/projectsApi';

export const useProjectsSummary = (projectList: any[]) => {
  return useQueries({
    queries: projectList.map((project: any) => ({
      // المفتاح لازم يكون فيه الـ id لكل مشروع عشان ميتداخلش
      queryKey: ['project-summary', project._id || project.id], 
      
      // هنا بنبعت الـ id الخاص بالمشروع ده بس (String) وليس المصفوفة (Array)
      queryFn: () => getProjectSummaryApi(project._id || project.id), 
      
      staleTime: 2 * 60 * 1000,
      enabled: !!(project._id || project.id), // ميبدأش الطلب لو الـ id مش موجود
    })),
  });
};