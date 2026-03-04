import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProjectApi } from '../api/projectsApi';

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProjectApi,
    onSuccess: () => {
      // ✅ تحديث الكاش عشان الأرقام الجديدة تظهر فوراً
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects-stats'] });
    },
  });
};