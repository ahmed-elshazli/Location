import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProjectApi } from '../api/projectsApi';

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProjectApi,
    onSuccess: () => {
      // تحديث قائمة المشاريع وإحصائياتها فوراً
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects-stats'] });
    }
  });
};