import React, { useState, useEffect } from 'react';
import { X, Pencil, RefreshCw } from 'lucide-react';
import { useUsers } from '../../users/hooks/useUsers';
import { useAllUnits } from '../../properties/hooks/useAllUnits';
import { useClients } from '../../clients/hooks/useClients';
import { useToastStore } from '../../../store/useToastStore';
import { useCreateDeal } from '../hooks/useCreateDeal';
import { useUpdateDeal } from '../hooks/useUpdateDeal';
import { useUpdateDealStatus } from '../hooks/useUpdateDealStatus';
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

type EditMode = 'view' | 'status' | 'full';

const statuses = ['NEW', 'NEGOTIATION', 'RESERVATION', 'CLOSED_WON', 'CLOSED_LOST'];

const STATUS_LABELS: Record<string, { ar: string; en: string; color: string }> = {
  NEW:         { ar: 'جديد',       en: 'New',          color: 'bg-blue-100 text-blue-700'   },
  NEGOTIATION: { ar: 'تفاوض',      en: 'Negotiation',  color: 'bg-purple-100 text-purple-700'},
  RESERVATION: { ar: 'حجز',        en: 'Reservation',  color: 'bg-orange-100 text-orange-700'},
  CLOSED_WON:  { ar: 'مغلق ناجح',  en: 'Closed Won',   color: 'bg-green-100 text-green-700' },
  CLOSED_LOST: { ar: 'مغلق خاسر', en: 'Closed Lost',  color: 'bg-gray-100 text-gray-600'   },
};

const PAYMENT_LABELS: Record<string, { ar: string; en: string }> = {
  cash:             { ar: 'كاش',          en: 'Cash'              },
  installment:      { ar: 'تقسيط',        en: 'Installment'       },
  cash_installment: { ar: 'كاش وتقسيط',  en: 'Cash & Installment'},
};

export function DealModal({ deal, onClose, onSave }: DealModalProps) {
  const { i18n }   = useTranslation(['deals', 'common']);
  const { dir }    = useConfigStore();
  const isRTL      = dir === 'rtl';
  const isAr       = i18n.language === 'ar';

  const { triggerToast } = useToastStore();

  const { data: usersData,   isLoading: isUsersLoading   } = useUsers();
  const { data: unitsData,   isLoading: isUnitsLoading   } = useAllUnits();
  const { data: clientsData, isLoading: isClientsLoading } = useClients();

  const usersList   = Array.isArray(usersData)          ? usersData          : (usersData?.data   || []);
  const unitsList   = Array.isArray(unitsData?.data)    ? unitsData.data     : (Array.isArray(unitsData)   ? unitsData   : []);
  const clientsList = Array.isArray(clientsData?.data)  ? clientsData.data   : (Array.isArray(clientsData) ? clientsData : []);

  const createDeal       = useCreateDeal();
  const updateDeal       = useUpdateDeal();
  const updateDealStatus = useUpdateDealStatus();
  const deleteMutation   = useDeleteDeal();

  const getId = (val: any) => {
    if (typeof val === 'object' && val !== null) return val._id || val.id || '';
    return val || '';
  };

  const [editMode, setEditMode]           = useState<EditMode>(deal ? 'view' : 'full');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    title:           deal?.title           || '',
    client:          getId(deal?.client),
    unit:            getId(deal?.unit),
    value:           deal?.value?.toString()           || '',
    salesAgent:      getId(deal?.salesAgent),
    status:          deal?.status          || 'NEW',
    paymentType:     deal?.paymentType     || 'cash',
    paidAmount:      deal?.paidAmount?.toString()      || '',
    remainingAmount: deal?.remainingAmount?.toString() || '',
    requiredAmount:  deal?.requiredAmount?.toString()  || '',
    notes:           deal?.notes           || '',
  });

  // Auto-calc remaining
  useEffect(() => {
    const required  = parseFloat(formData.requiredAmount) || 0;
    const paid      = parseFloat(formData.paidAmount)     || 0;
    const remaining = required - paid;
    if (remaining >= 0 && (formData.requiredAmount || formData.paidAmount)) {
      setFormData(prev => ({ ...prev, remainingAmount: remaining.toString() }));
    }
  }, [formData.requiredAmount, formData.paidAmount]);

  const isInstallment = formData.paymentType === 'installment' || formData.paymentType === 'cash_installment';

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

    const options = {
      onSuccess: () => {
        triggerToast(deal ? (isAr ? 'تم التحديث ✅' : 'Updated ✅') : (isAr ? 'تمت الإضافة 🚀' : 'Created 🚀'), 'success');
        onSave?.(formData);
        onClose();
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message;
        const knownErrors: Record<string, string> = {
          'Unit already sold': isAr ? 'هذه الوحدة تم بيعها مسبقاً' : 'This unit has already been sold',
          'Unit not found':    isAr ? 'الوحدة غير موجودة'           : 'Unit not found',
          'Client not found':  isAr ? 'العميل غير موجود'            : 'Client not found',
        };
        const displayMsg = typeof msg === 'string' && knownErrors[msg]
          ? knownErrors[msg]
          : Array.isArray(msg) ? msg[0] : msg || (isAr ? 'خطأ في الإرسال' : 'Submission error');
        triggerToast(displayMsg, 'error');
      },
    };

    if (!deal) {
      // ── Create: بيبعت كل الداتا ─────────────────────────────────────────
      createDeal.mutate({
        title:           formData.title,
        client:          formData.client,
        unit:            formData.unit,
        value:           Number(formData.value),
        salesAgent:      formData.salesAgent,
        // ❌ status ممنوع في create — الـ backend بيحدده تلقائياً
        paymentType:     formData.paymentType,
        paidAmount:      Number(formData.paidAmount)      || undefined,
        remainingAmount: Number(formData.remainingAmount) || undefined,
        requiredAmount:  Number(formData.requiredAmount)  || undefined,
        notes:           formData.notes || undefined,
      }, options);

    } else if (editMode === 'status') {
      // ── Update Status only: PATCH /api/v1/deals/{id}/status ────────────
      updateDealStatus.mutate(
        { id: deal._id || deal.id, status: formData.status },
        options
      );

    } else if (editMode === 'full') {
      // ── Update Full: PATCH /api/v1/deals/{id} ──────────────────────────
      updateDeal.mutate({
        id: deal._id || deal.id,
        data: {
          title:           formData.title,
          client:          formData.client,
          unit:            formData.unit,
          value:           Number(formData.value),
          salesAgent:      formData.salesAgent,
          // ❌ status ممنوع هنا — لازم يتبعت عبر /status endpoint
          paymentType:     formData.paymentType,
          paidAmount:      Number(formData.paidAmount)      || undefined,
          remainingAmount: Number(formData.remainingAmount) || undefined,
          requiredAmount:  Number(formData.requiredAmount)  || undefined,
          notes:           formData.notes || undefined,
        },
      }, options);
    }
  };

  const isPending = createDeal.isPending || updateDeal.isPending || updateDealStatus.isPending;

  // ── Field disabled logic ──────────────────────────────────────────────────
  const isLocked   = (field: 'status' | 'other') => {
    if (!deal) return false;                        // create mode: كله مفتوح
    if (editMode === 'view')   return true;         // view: كله مقفول
    if (editMode === 'status') return field !== 'status'; // status mode: بس status مفتوح
    return false;                                   // full: كله مفتوح
  };

  const inputClass = (field: 'status' | 'other') =>
    isLocked(field)
      ? 'w-full px-4 py-2 border border-[#E5E5E5] rounded-lg bg-[#F7F7F7] text-[#888] cursor-not-allowed'
      : 'w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]';

  const selectClass = (field: 'status' | 'other') =>
    isLocked(field)
      ? 'w-full px-4 py-2 border border-[#E5E5E5] rounded-lg bg-[#F7F7F7] text-[#888] cursor-not-allowed'
      : 'w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] bg-white';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className={`sticky top-0 bg-white border-b border-[#E5E5E5] px-6 py-4 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h2 className="font-bold text-[#16100A]">
              {!deal
                ? (isAr ? 'إنشاء صفقة جديدة' : 'Create New Deal')
                : editMode === 'status'
                  ? (isAr ? 'تعديل الحالة' : 'Update Status')
                  : editMode === 'full'
                    ? (isAr ? 'تعديل الصفقة' : 'Edit Deal')
                    : (isAr ? 'تفاصيل الصفقة' : 'Deal Details')}
            </h2>
            {/* Status badge in view mode */}
            {deal && editMode === 'view' && (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_LABELS[formData.status]?.color || 'bg-gray-100 text-gray-600'}`}>
                {isAr ? STATUS_LABELS[formData.status]?.ar : STATUS_LABELS[formData.status]?.en}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#555555]" />
          </button>
        </div>

        {/* ── Edit Mode Switcher (edit only) ────────────────────────────────── */}
        {deal && (
          <div className={`px-6 pt-4 flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              type="button"
              onClick={() => setEditMode(editMode === 'status' ? 'view' : 'status')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                editMode === 'status'
                  ? 'border-[#B5752A] bg-[#FEF3E2] text-[#B5752A]'
                  : 'border-[#E5E5E5] text-[#555555] hover:bg-[#F7F7F7]'
              } ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <RefreshCw className="w-4 h-4" />
              {isAr ? 'تعديل الحالة' : 'Update Status'}
            </button>
            <button
              type="button"
              onClick={() => setEditMode(editMode === 'full' ? 'view' : 'full')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                editMode === 'full'
                  ? 'border-[#B5752A] bg-[#FEF3E2] text-[#B5752A]'
                  : 'border-[#E5E5E5] text-[#555555] hover:bg-[#F7F7F7]'
              } ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Pencil className="w-4 h-4" />
              {isAr ? 'تعديل التفاصيل' : 'Edit Details'}
            </button>
          </div>
        )}

        {/* ── Form ───────────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Title */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isAr ? 'عنوان الصفقة' : 'Deal Title'} {!deal && '*'}
              </label>
              <input type="text" value={formData.title}
                onChange={e => !isLocked('other') && setFormData({ ...formData, title: e.target.value })}
                readOnly={isLocked('other')}
                className={inputClass('other')}
                placeholder={isAr ? 'مثال: بيع فيلا B1-034' : 'e.g., Villa B1-034 Sale'}
                required={!deal}
              />
            </div>

            {/* Client */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isAr ? 'العميل' : 'Client'} {!deal && '*'}
              </label>
              <select value={formData.client}
                onChange={e => !isLocked('other') && setFormData({ ...formData, client: e.target.value })}
                disabled={isLocked('other')}
                className={selectClass('other')}
                required={!deal}
              >
                <option value="">{isClientsLoading ? (isAr ? 'جاري التحميل...' : 'Loading...') : (isAr ? 'اختر العميل' : 'Select Client')}</option>
                {clientsList.map((c: any) => (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {c.fullName || c.name || c.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isAr ? 'الوحدة' : 'Unit'} {!deal && '*'}
              </label>
              <select value={formData.unit}
                onChange={e => !isLocked('other') && setFormData({ ...formData, unit: e.target.value })}
                disabled={isLocked('other')}
                className={selectClass('other')}
                required={!deal}
              >
                <option value="">{isUnitsLoading ? (isAr ? 'جاري التحميل...' : 'Loading...') : (isAr ? 'اختر الوحدة' : 'Select Unit')}</option>
                {unitsList.map((u: any) => (
                  <option key={u._id || u.id} value={u._id || u.id}>
                    {u.unitCode}{u.type ? ` - ${u.type}` : ''}{u.price ? ` (${u.price.toLocaleString()} EGP)` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Value */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isAr ? 'قيمة الصفقة (EGP)' : 'Deal Value (EGP)'} {!deal && '*'}
              </label>
              <input type="number" value={formData.value}
                onChange={e => !isLocked('other') && setFormData({ ...formData, value: e.target.value })}
                readOnly={isLocked('other')}
                className={inputClass('other')}
                placeholder="8500000"
                required={!deal}
              />
            </div>

            {/* Sales Agent */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isAr ? 'مندوب المبيعات' : 'Sales Agent'} {!deal && '*'}
              </label>
              <select value={formData.salesAgent}
                onChange={e => !isLocked('other') && setFormData({ ...formData, salesAgent: e.target.value })}
                disabled={isLocked('other')}
                className={selectClass('other')}
                required={!deal}
              >
                <option value="">{isUsersLoading ? (isAr ? 'جاري التحميل...' : 'Loading...') : (isAr ? 'اختر المندوب' : 'Select Agent')}</option>
                {usersList.map((a: any) => (
                  <option key={a._id || a.id} value={a._id || a.id}>
                    {a.fullName || a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isAr ? 'حالة الصفقة' : 'Deal Status'} *
                {deal && editMode === 'view' && (
                  <span className="text-xs text-[#AAAAAA] font-normal mx-2">
                    ({isAr ? 'اضغط "تعديل الحالة" للتغيير' : 'Click "Update Status" to change'})
                  </span>
                )}
              </label>
              <select value={formData.status}
                onChange={e => !isLocked('status') && setFormData({ ...formData, status: e.target.value })}
                disabled={isLocked('status')}
                className={selectClass('status')}
                required
              >
                {statuses.map(s => (
                  <option key={s} value={s}>
                    {isAr ? (STATUS_LABELS[s]?.ar || s) : (STATUS_LABELS[s]?.en || s)}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Type */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isAr ? 'طريقة الدفع' : 'Payment Type'} {!deal && '*'}
              </label>
              <select value={formData.paymentType}
                onChange={e => !isLocked('other') && setFormData({ ...formData, paymentType: e.target.value })}
                disabled={isLocked('other')}
                className={selectClass('other')}
                required={!deal}
              >
                {Object.entries(PAYMENT_LABELS).map(([val, lbl]) => (
                  <option key={val} value={val}>{isAr ? lbl.ar : lbl.en}</option>
                ))}
              </select>
            </div>

            {/* Required / Paid / Remaining — تقسيط فقط */}
            {isInstallment && (
              <>
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isAr ? 'المبلغ المطلوب (EGP)' : 'Required Amount (EGP)'} {!deal && '*'}
                  </label>
                  <input type="number" value={formData.requiredAmount}
                    onChange={e => !isLocked('other') && setFormData({ ...formData, requiredAmount: e.target.value })}
                    readOnly={isLocked('other')}
                    className={inputClass('other')}
                    placeholder="1500000"
                    required={!deal}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isAr ? 'المبلغ المدفوع (EGP)' : 'Paid Amount (EGP)'}
                  </label>
                  <input type="number" value={formData.paidAmount}
                    onChange={e => !isLocked('other') && setFormData({ ...formData, paidAmount: e.target.value })}
                    readOnly={isLocked('other')}
                    className={inputClass('other')}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isAr ? 'المبلغ المتبقي (EGP)' : 'Remaining Amount (EGP)'}
                  </label>
                  <input type="number" value={formData.remainingAmount} readOnly
                    className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg bg-[#F7F7F7] text-[#555555] cursor-not-allowed"
                    placeholder="0"
                  />
                </div>
              </>
            )}

            {/* Notes */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isAr ? 'ملاحظات' : 'Notes'}
              </label>
              <textarea value={formData.notes}
                onChange={e => !isLocked('other') && setFormData({ ...formData, notes: e.target.value })}
                readOnly={isLocked('other')}
                className={`${inputClass('other')} min-h-[100px]`}
                placeholder={isAr ? 'أضف أي ملاحظات إضافية...' : 'Add any additional notes...'}
              />
            </div>
          </div>

          {/* ── Footer ───────────────────────────────────────────────────────── */}
          <div className={`flex items-center justify-end gap-3 mt-8 pt-6 border-t border-[#E5E5E5] ${isRTL ? 'flex-row-reverse' : ''}`}>
            {deal && (
              <button type="button" onClick={() => setShowDeleteConfirm(true)}
                className={`px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ${isRTL ? 'ml-auto' : 'mr-auto'}`}>
                {isAr ? 'حذف الصفقة' : 'Delete Deal'}
              </button>
            )}
            <button type="button" onClick={onClose}
              className="px-6 py-2 border border-[#E5E5E5] rounded-lg text-[#555555] hover:bg-[#F7F7F7] transition-colors">
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            {/* Save button — يظهر فقط في create أو edit modes */}
            {(!deal || editMode !== 'view') && (
              <button type="submit" disabled={isPending}
                className="px-6 py-2 gradient-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all">
                {isPending ? '...' : isAr ? 'حفظ' : 'Save'}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── Confirm Delete ────────────────────────────────────────────────────── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <X className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-[#16100A] mb-2">
                {isAr ? 'حذف الصفقة؟' : 'Delete Deal?'}
              </h3>
              <p className="text-[#555555] text-sm mb-6">
                {isAr ? 'هل أنت متأكد؟ لا يمكن التراجع.' : 'Are you sure? This cannot be undone.'}
              </p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-[#E5E5E5] rounded-lg text-[#555555] hover:bg-[#F7F7F7] font-medium transition-colors">
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button onClick={handleDelete} disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold transition-colors disabled:opacity-50">
                  {deleteMutation.isPending ? '...' : (isAr ? 'حذف' : 'Delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}