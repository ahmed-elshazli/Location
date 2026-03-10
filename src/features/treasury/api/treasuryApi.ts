import { api } from '../../../utils/axios';

export interface Transaction {
  _id:        string;
  type:       'income' | 'expense';
  amount:     number;
  category:   string;
  source:     string;
  linkedDeal?: string;
  salesAgent?: string;
  date:        string;
  notes?:      string;
  createdBy?:  string;
  createdAt?:  string;
}

export interface TransactionStats {
  totalIncome:   number;
  totalExpenses: number;
  netBalance:    number;
}

export interface GetTransactionsParams {
  page?:     number;
  limit?:    number;
  type?:     'income' | 'expense';
  category?: string;
  dateFrom?: string;
  dateTo?:   string;
}

export interface CreateTransactionPayload {
  type:        'income' | 'expense';
  amount:      number;
  category:    string;
  source:      string;
  linkedDeal?: string;
  salesAgent?: string;
  date:        string;
  notes?:      string;
}

// ── Treasury API ──────────────────────────────────────────────────────────────
export const getTransactionsApi = (params?: GetTransactionsParams) =>
  api.get('/api/v1/treasury/transactions', { params }).then(r => r.data);

export const getTransactionStatsApi = () =>
  api.get('/api/v1/treasury/transactions/stats').then(r => r.data);

export const getTransactionByIdApi = (id: string) =>
  api.get(`/api/v1/treasury/transactions/${id}`).then(r => r.data);

export const createTransactionApi = (payload: CreateTransactionPayload) =>
  api.post('/api/v1/treasury/transactions', payload).then(r => r.data);

export const updateTransactionApi = (id: string, payload: Partial<CreateTransactionPayload>) =>
  api.patch(`/api/v1/treasury/transactions/${id}`, payload).then(r => r.data);

export const deleteTransactionApi = (id: string) =>
  api.delete(`/api/v1/treasury/transactions/${id}`).then(r => r.data);