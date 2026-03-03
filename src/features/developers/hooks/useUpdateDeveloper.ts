import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateDeveloperApi } from '../api/developersApi';

export const useUpdateDeveloper = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateDeveloperApi(id, data),
    onSuccess: () => {
      // تحديث كل البيانات المرتبطة بالمطورين
      queryClient.invalidateQueries({ queryKey: ['developers'] });
      queryClient.invalidateQueries({ queryKey: ['developers-summary'] });
      queryClient.invalidateQueries({ queryKey: ['developer-summary'] });
    },
  });
};