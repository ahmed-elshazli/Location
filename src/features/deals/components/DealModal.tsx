import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useUsers } from '../../users/hooks/useUsers';
import { useAllUnits } from '../../properties/hooks/useAllUnits';
import { useClients } from '../../clients/hooks/useClients';
import { useToastStore } from '../../../store/useToastStore';
import { useCreateDeal } from '../hooks/useCreateDeal';
import { useUpdateDeal } from '../hooks/useUpdateDeal';
import { useDeleteDeal } from '../hooks/useDeleteDeal';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../../store/useConfigStore';

interface Deal {
  _id?: string;
  id?: string;
  title: string;
  client: any;
  unit?: any;
  value?: number;
  salesAgent: any;
  status: string;
  createdAt?: string;
  notes?: string;
  paymentType?: string;
  paidAmount?: number;
  remainingAmount?: number;
  requiredAmount?: number;
}

interface DealModalProps {
  deal: Deal | null;
  onClose: () => void;
  onSave?: (deal: any) => void;
}

const statuses = ['NEW', 'NEGOTIATION', 'RESERVATION', 'CLOSED_WON', 'CLOSED_LOST'];

const getStatusLabel = (s: string) =>
  s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

export function DealModal({ deal, onClose, onSave }: DealModalProps) {
  const { t, i18n } = useTranslation(['deals', 'common']);
  const { dir } = useConfigStore();
  const isRTL = dir === 'rtl';
  const language = i18n.language;

  const { triggerToast } = useToastStore();

  const { data: usersData,   isLoading: isUsersLoading   } = useUsers();
  const { data: unitsData,   isLoading: isUnitsLoading   } = useAllUnits();
  const { data: clientsData, isLoading: isClientsLoading } = useClients();

  const getId = (val: any) =>
    typeof val === 'object' && val !== null ? val._id || val.id || '' : val || '';

  const usersList   = Array.isArray(usersData)         ? usersData        : (usersData?.data   || []);
  const unitsList   = (Array.isArray(unitsData?.data)  ? unitsData.data   : (Array.isArray(unitsData)   ? unitsData   : []))
    .filter((unit: any) => unit.status !== 'sold' || getId(deal?.unit) === (unit._id || unit.id));
  const clientsList = Array.isArray(clientsData?.data) ? clientsData.data : (Array.isArray(clientsData) ? clientsData : []);

  const createDeal     = useCreateDeal();
  const updateDeal     = useUpdateDeal();
  const deleteMutation = useDeleteDeal();

  const [formData, setFormData] = useState({
    title:           deal?.title || '',
    client:          typeof deal?.client === 'string' ? deal.client : getId(deal?.client),
    unit:            getId(deal?.unit),           // unit بييجي object { unitCode, type }
    value:           deal?.value?.toString() || '',
    salesAgent:      getId(deal?.salesAgent),     // salesAgent بييجي object { fullName }
    status:          deal?.status || 'NEW',
    paymentType:     deal?.paymentType || 'cash',
    paidAmount:      deal?.paidAmount?.toString() || '',
    remainingAmount: deal?.remainingAmount?.toString() || '',
    requiredAmount:  deal?.requiredAmount?.toString() || '',
    notes:           deal?.notes || '',
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Auto-calculate remaining = requiredAmount - paidAmount
  useEffect(() => {
    const required  = parseFloat(formData.requiredAmount) || 0;
    const paid      = parseFloat(formData.paidAmount)     || 0;
    const remaining = required - paid;
    if (remaining >= 0 && (formData.requiredAmount || formData.paidAmount)) {
      setFormData(prev => ({ ...prev, remainingAmount: remaining.toString() }));
    }
  }, [formData.requiredAmount, formData.paidAmount]);

  const handleDelete = () => {
    deleteMutation.mutate(deal?._id || deal?.id, {
      onSuccess: () => onClose(),
      onError: (err: any) => {
        const msg = err.response?.data?.message;
        triggerToast(Array.isArray(msg) ? msg[0] : msg || 'فشل الحذف', 'error');
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title:           formData.title,
      client:          formData.client,
      unit:            formData.unit,
      value:           Number(formData.value),
      salesAgent:      formData.salesAgent,
      status:          formData.status,
      notes:           formData.notes,
      paymentType:     formData.paymentType,
      paidAmount:      Number(formData.paidAmount),
      remainingAmount: Number(formData.remainingAmount),
      requiredAmount:  Number(formData.requiredAmount),
    };

    const options = {
      onSuccess: () => {
        triggerToast(deal ? 'تم تحديث الصفقة ✅' : 'تمت الإضافة 🚀', 'success');
        onSave?.(payload);
        onClose();
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message;
        const knownErrors: Record<string, string> = {
          'Unit already sold': language === 'ar' ? 'هذه الوحدة تم بيعها مسبقاً' : 'This unit has already been sold',
          'Unit not found':    language === 'ar' ? 'الوحدة غير موجودة' : 'Unit not found',
          'Client not found':  language === 'ar' ? 'العميل غير موجود' : 'Client not found',
        };
        const displayMsg = typeof msg === 'string' && knownErrors[msg]
          ? knownErrors[msg]
          : Array.isArray(msg) ? msg[0] : msg || 'خطأ في الإرسال';
        triggerToast(displayMsg, 'error');
      },
    };

    if (deal) {
      updateDeal.mutate({ id: deal._id || deal.id, data: payload }, options);
    } else {
      createDeal.mutate(payload, options);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>

        {/* Header */}
        <div className={`sticky top-0 bg-white border-b border-[#E5E5E5] px-6 py-4 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h2 className="font-bold text-[#16100A]">
            {deal
              ? (language === 'ar' ? 'تعديل الصفقة' : 'Edit Deal')
              : (language === 'ar' ? 'إنشاء صفقة جديدة' : 'Create New Deal')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#555555]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Title */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'عنوان الصفقة' : 'Deal Title'} *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626]"
                placeholder={language === 'ar' ? 'مثال: بيع فيلا B1-034' : 'e.g., Villa B1-034 Sale'}
                required
              />
            </div>

            {/* Client */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'العميل' : 'Client'} *
              </label>
              <select
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626] bg-white"
                required
              >
                <option value="">{isClientsLoading ? 'Loading...' : (language === 'ar' ? 'اختر العميل' : 'Select Client')}</option>
                {clientsList.map((client: any) => (
                  <option key={client._id || client.id} value={client._id || client.id}>
                    {client.fullName || client.name || client.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'الوحدة' : 'Unit'} *
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626] bg-white"
                required
              >
                <option value="">{isUnitsLoading ? 'Loading...' : (language === 'ar' ? 'اختر الوحدة' : 'Select Unit')}</option>
                {unitsList.map((unit: any) => (
                  <option key={unit._id || unit.id} value={unit._id || unit.id}>
                    {unit.unitCode} {unit.type ? `- ${unit.type}` : ''} {unit.price ? `(${unit.price.toLocaleString()} EGP)` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Value */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'قيمة الصفقة (EGP)' : 'Deal Value (EGP)'} *
              </label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626]"
                placeholder="8500000"
                required
              />
            </div>

            {/* Sales Agent */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'مندوب المبيعات' : 'Sales Agent'} *
              </label>
              <select
                value={formData.salesAgent}
                onChange={(e) => setFormData({ ...formData, salesAgent: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626] bg-white"
                required
              >
                <option value="">{isUsersLoading ? 'Loading...' : (language === 'ar' ? 'اختر المندوب' : 'Select Agent')}</option>
                {usersList.map((agent: any) => (
                  <option key={agent._id || agent.id} value={agent._id || agent.id}>
                    {agent.fullName || agent.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'حالة الصفقة' : 'Deal Status'} *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626] bg-white"
                required
              >
                {statuses.map(s => (
                  <option key={s} value={s}>{getStatusLabel(s)}</option>
                ))}
              </select>
            </div>

            {/* Payment Type */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'طريقة الدفع' : 'Payment Type'} *
              </label>
              <select
                value={formData.paymentType}
                onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626] bg-white"
                required
              >
                <option value="cash">{language === 'ar' ? 'كاش' : 'Cash'}</option>
                <option value="installment">{language === 'ar' ? 'تقسيط' : 'Installment'}</option>
                <option value="mortgage">{language === 'ar' ? 'رهن عقاري' : 'Mortgage'}</option>
              </select>
            </div>

            {/* Required Amount */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'المبلغ المطلوب (EGP)' : 'Required Amount (EGP)'} *
              </label>
              <input
                type="number"
                value={formData.requiredAmount}
                onChange={(e) => setFormData({ ...formData, requiredAmount: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626]"
                placeholder="1500000"
                required
              />
            </div>

            {/* Paid Amount */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'المبلغ المدفوع (EGP)' : 'Paid Amount (EGP)'}
              </label>
              <input
                type="number"
                value={formData.paidAmount}
                onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626]"
                placeholder="0"
              />
            </div>

            {/* Remaining Amount - auto calculated */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'المبلغ المتبقي (EGP)' : 'Remaining Amount (EGP)'}
              </label>
              <input
                type="number"
                value={formData.remainingAmount}
                readOnly
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg bg-[#F7F7F7] text-[#555555] cursor-not-allowed"
                placeholder="0"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'ملاحظات' : 'Notes'}
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626] min-h-[100px]"
                placeholder={language === 'ar' ? 'أضف أي ملاحظات إضافية...' : 'Add any additional notes...'}
              />
            </div>
          </div>

          {/* Actions */}
          <div className={`flex items-center justify-end gap-3 mt-8 pt-6 border-t border-[#E5E5E5] ${isRTL ? 'flex-row-reverse' : ''}`}>
            {deal && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mr-auto"
              >
                {language === 'ar' ? 'حذف الصفقة' : 'Delete Deal'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-[#E5E5E5] rounded-lg text-[#555555] hover:bg-[#F7F7F7] transition-colors"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={createDeal.isPending || updateDeal.isPending}
              className="px-6 py-2 gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {createDeal.isPending || updateDeal.isPending
                ? '...'
                : deal
                  ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes')
                  : (language === 'ar' ? 'إنشاء الصفقة' : 'Create Deal')}
            </button>
          </div>
        </form>
      </div>

      {/* Confirm Delete Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <X className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-[#16100A] mb-2">
                {language === 'ar' ? 'حذف الصفقة؟' : 'Delete Deal?'}
              </h3>
              <p className="text-[#555555] text-sm mb-6">
                {language === 'ar'
                  ? 'هل أنت متأكد من حذف هذه الصفقة؟ لا يمكن التراجع عن هذا الإجراء.'
                  : 'Are you sure you want to delete this deal? This action cannot be undone.'}
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-[#E5E5E5] rounded-lg text-[#555555] hover:bg-[#F7F7F7] font-medium transition-colors"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold transition-colors disabled:opacity-50"
                >
                  {deleteMutation.isPending ? '...' : (language === 'ar' ? 'حذف' : 'Delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}