import { useQuery } from '@tanstack/react-query';
import { getTransactionStatsApi } from '../api/treasuryApi';

export const useTransactionStats = () =>
  useQuery({
    queryKey: ['transaction-stats'],
    queryFn:  getTransactionStatsApi,
    staleTime: 2 * 60 * 1000,
  });