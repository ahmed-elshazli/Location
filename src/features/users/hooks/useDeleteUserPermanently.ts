import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteUserPermanently } from '../api/usersApi';

export const useDeleteUserPermanently = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUserPermanently,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};