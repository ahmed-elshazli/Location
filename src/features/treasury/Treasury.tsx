import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, TrendingUp, TrendingDown, Search, Filter, Edit2, Trash2, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../store/useConfigStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Transaction, CreateTransactionPayload, exportTransactionsApi } from './api/treasuryApi';
import { useTransactions } from './hooks/useTransactions';
import { useTransactionStats } from './hooks/useTransactionStats';
import { useCreateTransaction } from './hooks/useCreateTransaction';
import { useUpdateTransaction } from './hooks/useUpdateTransaction';
import { useDeleteTransaction } from './hooks/useDeleteTransaction';
import { TransactionModal } from './components/TransactionModal';

const CATEGORY_AR: Record<string, string> = {
  'Property Sale Commission': 'عمولة بيع عقار',
  'Booking Fees':             'رسوم حجز',
  'Installments':             'أقساط',
  'Investment Returns':       'عائد استثمار',
  'Office Expenses':          'مصروفات المكتب',
  'Marketing':                'التسويق',
  'Advertising':              'الإعلانات',
  'Salaries':                 'الرواتب',
  'Sales Commissions':        'عمولات السيلز',
  'Transportation':           'مواصلات',
  'Other':                    'أخرى',
};

const safeStr = (val: any, fallback = '—'): string => {
  if (val == null) return fallback;
  if (typeof val === 'string') return val || fallback;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object')
    return val.title || val.fullName || val.name || val.label || val._id || val.id || fallback;
  return String(val) || fallback;
};

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-[#F0F0F0] rounded ${className}`} />
);

export default function Treasury() {
  const { i18n }      = useTranslation();
  const { dir }       = useConfigStore();
  const { user }      = useAuthStore();
  const isRTL         = dir === 'rtl';
  const isAr          = i18n.language === 'ar';

  const [page, setPage]                             = useState(1);
  const LIMIT = 15;

  const [isModalOpen, setIsModalOpen]               = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm]                 = useState('');
  const [typeFilter, setTypeFilter]                 = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter]         = useState('all');
  const [sourceFilter, setSourceFilter]             = useState('all');
  const [dateFrom, setDateFrom]                     = useState('');
  const [dateTo, setDateTo]                         = useState('');
  const [showFilters, setShowFilters]               = useState(false);

  // ── Server-side paginated fetch ───────────────────────────────────────────
  const { data: txData, isLoading: loadingTx } = useTransactions({
    page,
    limit: LIMIT,
    type: typeFilter === 'all' ? undefined : typeFilter,
  });

  const { data: statsData, isLoading: loadingStats } = useTransactionStats();

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const transactions: Transaction[] = txData?.data || txData || [];
  const totalPages: number          = txData?.pagination?.numberOfPages ?? 1;
  const totalResults: number        = txData?.results ?? transactions.length;
  const stats                       = statsData?.data || statsData || {};

  // Client-side filter (search + date + category + source) على الصفحة الحالية
  const filtered = transactions.filter((tx: any) => {
    const haystack = `${safeStr(tx.category)} ${safeStr(tx.source)} ${safeStr(tx.linkedDeal)} ${safeStr(tx.salesAgent)}`.toLowerCase();
    const matchSearch   = !searchTerm        || haystack.includes(searchTerm.toLowerCase());
    const matchDateFrom = !dateFrom          || tx.date >= dateFrom;
    const matchDateTo   = !dateTo            || tx.date?.split('T')[0] <= dateTo;
    const matchCategory = categoryFilter === 'all' || safeStr(tx.category) === categoryFilter;
    const matchSource   = sourceFilter   === 'all' || safeStr(tx.source)   === sourceFilter;
    return matchSearch && matchDateFrom && matchDateTo && matchCategory && matchSource;
  });

  // Dynamic filter options من الصفحة الحالية
  const allCategories = [...new Set(transactions.map((tx: any) => safeStr(tx.category)).filter(c => c !== '—'))];
  const allSources    = [...new Set(transactions.map((tx: any) => safeStr(tx.source)).filter(s => s !== '—'))];

  const canManage = user?.role === 'super_admin' || user?.role === 'admin';

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [typeFilter, searchTerm, categoryFilter, sourceFilter, dateFrom, dateTo]);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat(isAr ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP', minimumFractionDigits: 0 }).format(v || 0);

  const formatDate = (d: string) => {
    try {
      return new Intl.DateTimeFormat(isAr ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(d));
    } catch { return d || '—'; }
  };

  const handleExport = async () => {
    try {
      const blob = await exportTransactionsApi();
      const url  = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `treasury-export-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const handleSave = (payload: CreateTransactionPayload) => {
    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction._id, payload }, {
        onSuccess: () => { setIsModalOpen(false); setEditingTransaction(null); }
      });
    } else {
      createMutation.mutate(payload, { onSuccess: () => setIsModalOpen(false) });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm(isAr ? 'هل أنت متأكد من حذف هذه المعاملة؟' : 'Delete this transaction?')) {
      deleteMutation.mutate(id);
    }
  };

  const colCount = canManage ? 8 : 7;

  return (
    <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Header */}
      <div className={`mb-8 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h1 className="text-2xl font-bold text-[#16100A] mb-1">{isAr ? 'الخزينة' : 'Treasury'}</h1>
          <p className="text-[#555555]">{isAr ? 'إدارة المعاملات المالية' : 'Manage financial transactions'}</p>
        </div>
        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={handleExport}
            className={`border border-[#B5752A] text-[#B5752A] px-5 py-3 rounded-lg hover:bg-[#FEF3E2] transition-colors flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Download className="w-5 h-5" />
            <span className="font-medium">{isAr ? 'تصدير Excel' : 'Export Excel'}</span>
          </button>
          {canManage && (
            <button onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}
              className={`gradient-primary text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Plus className="w-5 h-5" />
              <span className="font-medium">{isAr ? 'إضافة معاملة' : 'Add Transaction'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { icon: TrendingUp,   val: stats.totalIncome,   label: isAr ? 'إجمالي الإيرادات' : 'Total Income',   color: 'green',  textColor: 'text-green-600'  },
          { icon: TrendingDown, val: stats.totalExpenses, label: isAr ? 'إجمالي المصروفات' : 'Total Expenses', color: 'red',    textColor: 'text-red-600'    },
          { icon: DollarSign,   val: stats.netBalance,    label: isAr ? 'صافي الرصيد'       : 'Net Balance',   color: 'yellow', textColor: (stats.netBalance ?? 0) >= 0 ? 'text-[#16100A]' : 'text-red-600' },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-lg border border-[#E5E5E5] p-6">
            <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`w-12 h-12 bg-${card.color}-50 rounded-lg flex items-center justify-center`}>
                <card.icon className={`w-6 h-6 text-${card.color}-600`} />
              </div>
            </div>
            {loadingStats
              ? <Skeleton className="h-9 w-32 mb-2" />
              : <p className={`text-3xl font-bold mb-2 ${card.textColor}`} dir="ltr">{formatCurrency(card.val)}</p>}
            <p className={`text-sm text-[#555555] ${isRTL ? 'text-right' : 'text-left'}`}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-[#E5E5E5] p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="flex-1 relative">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555] ${isRTL ? 'right-3' : 'left-3'}`} />
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder={isAr ? 'بحث...' : 'Search...'}
                className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`}
              />
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-2 border rounded-lg transition-colors flex items-center gap-2 ${showFilters ? 'border-[#B5752A] bg-[#FEF3E2] text-[#B5752A]' : 'border-[#E5E5E5] hover:bg-[#F7F7F7] text-[#555555]'} ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Filter className="w-5 h-5" />
              <span>{isAr ? 'فلترة' : 'Filter'}</span>
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-[#E5E5E5]">
              <div>
                <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{isAr ? 'نوع العملية' : 'Type'}</label>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]">
                  <option value="all">{isAr ? 'الكل' : 'All'}</option>
                  <option value="income">{isAr ? 'إيرادات' : 'Income'}</option>
                  <option value="expense">{isAr ? 'مصروفات' : 'Expenses'}</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{isAr ? 'التصنيف' : 'Category'}</label>
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]">
                  <option value="all">{isAr ? 'الكل' : 'All'}</option>
                  {allCategories.map(cat => (
                    <option key={cat} value={cat}>{isAr ? (CATEGORY_AR[cat] || cat) : cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{isAr ? 'المصدر' : 'Source'}</label>
                <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]">
                  <option value="all">{isAr ? 'الكل' : 'All'}</option>
                  {allSources.map(src => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{isAr ? 'من تاريخ' : 'Date From'}</label>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]" />
              </div>
              <div>
                <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{isAr ? 'إلى تاريخ' : 'Date To'}</label>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F7F7F7] border-b border-[#E5E5E5]">
              <tr>
                {[
                  isAr ? 'النوع'    : 'Type',
                  isAr ? 'المبلغ'   : 'Amount',
                  isAr ? 'التصنيف'  : 'Category',
                  isAr ? 'المصدر'   : 'Source',
                  isAr ? 'الصفقة'   : 'Linked Deal',
                  isAr ? 'المبيعات' : 'Sales Agent',
                  isAr ? 'التاريخ'  : 'Date',
                  ...(canManage ? [isAr ? 'إجراءات' : 'Actions'] : []),
                ].map((h, i) => (
                  <th key={i} className={`px-6 py-4 text-sm font-semibold text-[#16100A] ${isRTL ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loadingTx ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-[#E5E5E5]">
                    {[...Array(colCount)].map((_, j) => (
                      <td key={j} className="px-6 py-4"><Skeleton className="h-5 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="px-6 py-12 text-center text-[#555555]">
                    {isAr ? 'لا توجد معاملات' : 'No transactions found'}
                  </td>
                </tr>
              ) : (
                filtered.map((tx: any) => (
                  <tr key={tx._id} className="border-b border-[#E5E5E5] hover:bg-[#FAFAFA]">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        tx.type === 'income' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {tx.type === 'income' ? (isAr ? 'إيراد' : 'Income') : (isAr ? 'مصروف' : 'Expense')}
                      </span>
                    </td>
                    <td className={`px-6 py-4 font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`} dir="ltr">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className={`px-6 py-4 text-[#16100A] ${isRTL ? 'text-right' : 'text-left'}`}>
                      {isAr ? (CATEGORY_AR[safeStr(tx.category)] || safeStr(tx.category)) : safeStr(tx.category)}
                    </td>
                    <td className={`px-6 py-4 text-[#555555] ${isRTL ? 'text-right' : 'text-left'}`}>{safeStr(tx.source)}</td>
                    <td className={`px-6 py-4 text-[#555555] ${isRTL ? 'text-right' : 'text-left'}`}>{safeStr(tx.linkedDeal)}</td>
                    <td className={`px-6 py-4 text-[#555555] ${isRTL ? 'text-right' : 'text-left'}`}>{safeStr(tx.salesAgent)}</td>
                    <td className={`px-6 py-4 text-[#555555] ${isRTL ? 'text-right' : 'text-left'}`}>{formatDate(tx.date)}</td>
                    {canManage && (
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <button onClick={() => { setEditingTransaction(tx); setIsModalOpen(true); }}
                            className="p-2 text-[#B5752A] hover:bg-[#FEF3E2] rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(tx._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className={`px-6 py-4 bg-[#F7F7F7] border-t border-[#E5E5E5] flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <p className="text-sm text-[#555555]">
            {isAr
              ? `${totalResults} معاملة — صفحة ${page} من ${totalPages}`
              : `${totalResults} transactions — Page ${page} of ${totalPages}`}
          </p>

          {totalPages > 1 && (
            <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {/* Prev */}
              <button disabled={page === 1 || loadingTx} onClick={() => setPage(p => p - 1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E5E5] hover:bg-white disabled:opacity-40 transition-colors">
                {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
                const isFirst  = p === 1;
                const isLast   = p === totalPages;
                const isNear   = Math.abs(p - page) <= 1;
                if (!isFirst && !isLast && !isNear) {
                  if (p === 2 || p === totalPages - 1) {
                    return <span key={p} className="text-[#555555] text-sm px-1">…</span>;
                  }
                  return null;
                }
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? 'gradient-primary text-white'
                        : 'border border-[#E5E5E5] text-[#555555] hover:bg-white'
                    }`}>
                    {p}
                  </button>
                );
              })}

              {/* Next */}
              <button disabled={page === totalPages || loadingTx} onClick={() => setPage(p => p + 1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E5E5] hover:bg-white disabled:opacity-40 transition-colors">
                {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <TransactionModal
          transaction={editingTransaction}
          onClose={() => { setIsModalOpen(false); setEditingTransaction(null); }}
          onSave={handleSave}
          isPending={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}