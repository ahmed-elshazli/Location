import { useQuery } from '@tanstack/react-query';
import { getTransactionsApi, GetTransactionsParams } from '../api/treasuryApi';

export const useTransactions = (params?: GetTransactionsParams) =>
  useQuery({
    queryKey: ['transactions', params],
    queryFn:  () => getTransactionsApi(params),
    staleTime: 0,
    placeholderData: (prev) => prev,
  });