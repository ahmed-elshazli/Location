import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../../store/useConfigStore';
import { Transaction, CreateTransactionPayload } from '../api/treasuryApi';
import { useDeals } from '../../deals/hooks/useDeals';
import { useUsers } from '../../users/hooks/useUsers';

interface TransactionModalProps {
  transaction: Transaction | null;
  onClose:     () => void;
  onSave:      (payload: CreateTransactionPayload) => void;
  isPending?:  boolean;
}

const INCOME_CATEGORIES  = ['Property Sale Commission','Booking Fees','Installments','Investment Returns','Other'];
const EXPENSE_CATEGORIES = ['Office Expenses','Marketing','Advertising','Salaries','Sales Commissions','Transportation','Other'];

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

export function TransactionModal({ transaction, onClose, onSave, isPending }: TransactionModalProps) {
  const { i18n }   = useTranslation();
  const { dir }    = useConfigStore();
  const isRTL      = dir === 'rtl';
  const isAr       = i18n.language === 'ar';

  // ── Fetch deals & users for selects ──────────────────────────────────────
  const { data: dealsData } = useDeals();
  const { data: usersData } = useUsers();

  const dealsList = Array.isArray(dealsData?.data) ? dealsData.data : (Array.isArray(dealsData) ? dealsData : []);
  const usersList = Array.isArray(usersData?.data) ? usersData.data : (Array.isArray(usersData) ? usersData : []);

  // ── helper: extract ObjectId from field (may come as object or string) ───
  const getId = (val: any) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val._id || val.id || '';
  };

  const [formData, setFormData] = useState<CreateTransactionPayload>({
    type:        transaction?.type       || 'income',
    amount:      transaction?.amount     || 0,
    category:    transaction?.category   || '',
    source:      transaction?.source     || '',
    linkedDeal:  getId(transaction?.linkedDeal),
    salesAgent:  getId(transaction?.salesAgent),
    date:        transaction?.date ? transaction.date.split('T')[0] : new Date().toISOString().split('T')[0],
    notes:       transaction?.notes || '',
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        type:        transaction.type,
        amount:      transaction.amount,
        category:    transaction.category,
        source:      transaction.source,
        linkedDeal:  getId(transaction.linkedDeal),
        salesAgent:  getId(transaction.salesAgent),
        date:        transaction.date.split('T')[0],
        notes:       transaction.notes || '',
      });
    }
  }, [transaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      linkedDeal: formData.linkedDeal || undefined,
      salesAgent: formData.salesAgent || undefined,
      notes:      formData.notes      || undefined,
    });
  };

  const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const label = (key: string) => isAr ? (CATEGORY_AR[key] || key) : key;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>

        {/* Header */}
        <div className={`sticky top-0 bg-white border-b border-[#E5E5E5] px-6 py-4 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h2 className="font-bold text-[#16100A]">
            {transaction ? (isAr ? 'تعديل المعاملة' : 'Edit Transaction') : (isAr ? 'إضافة معاملة جديدة' : 'Add New Transaction')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#555555]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Type */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isAr ? 'نوع المعاملة' : 'Transaction Type'} *
              </label>
              <div className="grid grid-cols-2 gap-4">
                {(['income', 'expense'] as const).map(type => (
                  <button key={type} type="button"
                    onClick={() => setFormData({ ...formData, type, category: '' })}
                    className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                      formData.type === type
                        ? type === 'income' ? 'border-green-600 bg-green-50 text-green-700' : 'border-red-600 bg-red-50 text-red-700'
                        : 'border-[#E5E5E5] text-[#555555] hover:border-[#B5752A]'
                    }`}>
                    {type === 'income' ? (isAr ? 'إيراد' : 'Income') : (isAr ? 'مصروف' : 'Expense')}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isAr ? 'المبلغ' : 'Amount'} *
              </label>
              <input type="number" required min="0" step="0.01"
                value={formData.amount || ''}
                onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder={isAr ? 'أدخل المبلغ' : 'Enter amount'}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]"
              />
            </div>

            {/* Category */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isAr ? 'التصنيف' : 'Category'} *
              </label>
              <select required value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] bg-white">
                <option value="">{isAr ? 'اختر التصنيف' : 'Select category'}</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{label(cat)}</option>
                ))}
              </select>
            </div>

            {/* Source */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isAr ? 'المصدر' : 'Source'} *
              </label>
              <input type="text" required
                value={formData.source}
                onChange={e => setFormData({ ...formData, source: e.target.value })}
                placeholder={isAr ? 'مثال: حملة إعلانات فيسبوك' : 'e.g., Facebook Ads Campaign'}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]"
              />
            </div>

            {/* Linked Deal — select من الـ API */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isAr ? 'الصفقة المرتبطة' : 'Linked Deal'}
                <span className="text-[#AAAAAA] font-normal mx-1">({isAr ? 'اختياري' : 'Optional'})</span>
              </label>
              <select value={formData.linkedDeal || ''}
                onChange={e => setFormData({ ...formData, linkedDeal: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] bg-white">
                <option value="">{isAr ? 'اختر صفقة' : 'Select deal'}</option>
                {dealsList.map((deal: any) => (
                  <option key={deal._id || deal.id} value={deal._id || deal.id}>
                    {deal.title || deal.name || deal._id}
                  </option>
                ))}
              </select>
            </div>

            {/* Sales Agent — select من الـ API */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isAr ? 'موظف المبيعات' : 'Sales Agent'}
                <span className="text-[#AAAAAA] font-normal mx-1">({isAr ? 'اختياري' : 'Optional'})</span>
              </label>
              <select value={formData.salesAgent || ''}
                onChange={e => setFormData({ ...formData, salesAgent: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] bg-white">
                <option value="">{isAr ? 'اختر موظف' : 'Select agent'}</option>
                {usersList.map((u: any) => (
                  <option key={u.id || u._id} value={u.id || u._id}>
                    {u.fullName || u.name || u.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isAr ? 'التاريخ' : 'Date'} *
              </label>
              <input type="date" required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isAr ? 'ملاحظات' : 'Notes'}
                <span className="text-[#AAAAAA] font-normal mx-1">({isAr ? 'اختياري' : 'Optional'})</span>
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder={isAr ? 'أضف أي ملاحظات إضافية...' : 'Add any additional notes...'}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] min-h-[100px]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className={`flex gap-4 mt-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button type="submit" disabled={isPending}
              className="flex-1 gradient-primary text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {isPending ? '...' : (isAr ? 'حفظ' : 'Save')}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 border border-[#E5E5E5] text-[#555555] py-3 rounded-lg font-medium hover:bg-[#F7F7F7] transition-colors">
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}