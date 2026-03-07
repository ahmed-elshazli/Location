import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateLeadApi, updateLeadStatusApi } from '../api/leadsApi';

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateLeadApi(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });
};

export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateLeadStatusApi(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });
};