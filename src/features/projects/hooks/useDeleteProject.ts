import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProjectApi } from '../api/projectsApi';

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProjectApi,
    onSuccess: () => {
      // ✅ تحديث الكاش فوراً لمزامنة الأرقام والقوائم
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects-stats'] });
    },
  });
};