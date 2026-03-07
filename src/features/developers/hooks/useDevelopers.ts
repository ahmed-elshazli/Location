import { useQuery } from '@tanstack/react-query';
import { fetchDevelopers } from '../api/developersApi';

export const useDevelopers = () => {
  return useQuery({
    queryKey: ['developers'],
    queryFn: () => fetchDevelopers(),
  });
};