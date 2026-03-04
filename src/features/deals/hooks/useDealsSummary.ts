import { useQuery } from '@tanstack/react-query';
import { getPipelineSummaryApi } from '../api/dealsApi';

export const useDealsSummary = () => {
  return useQuery({
    queryKey: ['deals-summary'],
    queryFn: getPipelineSummaryApi,
  });
};