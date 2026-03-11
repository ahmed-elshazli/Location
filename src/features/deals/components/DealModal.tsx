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
  prefillClient?: { id: string; fullName: string } | null;
}

type EditMode = 'view' | 'status' | 'full';

const statuses = ['NEW', 'NEGOTIATION', 'RESERVATION', 'CLOSED_WON', 'CLOSED_LOST'];

const STATUS_LABELS: Record<string, { ar: string; en: string; color: string }> = {
  NEW:         { ar: 'جديد',       en: 'New',         color: 'bg-blue-100 text-blue-700'    },
  NEGOTIATION: { ar: 'تفاوض',      en: 'Negotiation', color: 'bg-purple-100 text-purple-700' },
  RESERVATION: { ar: 'حجز',        en: 'Reservation', color: 'bg-orange-100 text-orange-700' },
  CLOSED_WON:  { ar: 'مغلق ناجح',  en: 'Closed Won',  color: 'bg-green-100 text-green-700'   },
  CLOSED_LOST: { ar: 'مغلق خاسر', en: 'Closed Lost', color: 'bg-gray-100 text-gray-600'     },
};

const PAYMENT_LABELS: Record<string, { ar: string; en: string }> = {
  cash:             { ar: 'كاش',         en: 'Cash'               },
  installment:      { ar: 'تقسيط',       en: 'Installment'        },
  cash_installment: { ar: 'كاش وتقسيط', en: 'Cash & Installment' },
};

const getId = (val: any): string => {
  if (typeof val === 'object' && val !== null) return val._id || val.id || '';
  return val || '';
};

export function DealModal({ deal, onClose, onSave, prefillClient }: DealModalProps) {
  const { i18n }  = useTranslation(['deals', 'common']);
  const { dir }   = useConfigStore();
  const isRTL     = dir === 'rtl';
  const isAr      = i18n.language === 'ar';

  const { triggerToast } = useToastStore();

  const { data: usersData,   isLoading: isUsersLoading   } = useUsers();
  const { data: unitsData,   isLoading: isUnitsLoading   } = useAllUnits();
  const { data: clientsData, isLoading: isClientsLoading } = useClients();

  const usersList   = Array.isArray(usersData)         ? usersData         : (usersData?.data   || []);
  const allUnits    = Array.isArray(unitsData?.data)   ? unitsData.data    : (Array.isArray(unitsData)   ? unitsData   : []);
  const clientsList = Array.isArray(clientsData?.data) ? clientsData.data  : (Array.isArray(clientsData) ? clientsData : []);

  // كل الـ units تظهر في الـ select — الـ deal unit متاحة دايماً حتى لو sold
  const dealUnitId   = getId(deal?.unit);
  const dealUnitCode = typeof deal?.unit === 'object' ? deal?.unit?.unitCode : null;
  const unitInList   = allUnits.some((u: any) => (u._id || u.id) === dealUnitId);
  const unitsList    = [
    ...(dealUnitId && !unitInList && dealUnitCode
      ? [{ _id: dealUnitId, unitCode: dealUnitCode, type: deal?.unit?.type, price: deal?.unit?.price }]
      : []),
    ...allUnits,
  ];

  // الـ salesAgent: لو بييجي بدون _id، نضيفه كـ option مؤقت باسمه
  const dealAgentId   = getId(deal?.salesAgent);
  const dealAgentName = typeof deal?.salesAgent === 'object'
    ? deal?.salesAgent?.fullName || deal?.salesAgent?.name
    : null;
  const agentInList   = usersList.some((u: any) => (u._id || u.id) === dealAgentId);

  const createDeal       = useCreateDeal();
  const updateDeal       = useUpdateDeal();
  const updateDealStatus = useUpdateDealStatus();
  const deleteMutation   = useDeleteDeal();

  const [editMode, setEditMode]               = useState<EditMode>(deal ? 'view' : 'full');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const initialData = {
    title:           deal?.title                        || '',
    client:          prefillClient?.id                  || getId(deal?.client),
    unit:            dealUnitId,
    value:           deal?.value?.toString()            || '',
    salesAgent:      dealAgentId,
    status:          deal?.status                       || 'NEW',
    paymentType:     deal?.paymentType?.toLowerCase()   || 'cash',
    paidAmount:      deal?.paidAmount?.toString()       || '',
    remainingAmount: deal?.remainingAmount?.toString()  || '',
    requiredAmount:  deal?.requiredAmount?.toString()   || '',
    notes:           deal?.notes                        || '',
  };

  const [formData, setFormData] = useState(initialData);

  // هل في تغيير فعلي؟
  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  // Auto-calc remaining
  useEffect(() => {
    if (editMode === 'view' || editMode === 'status') return;
    const required  = parseFloat(formData.requiredAmount) || 0;
    const paid      = parseFloat(formData.paidAmount)     || 0;
    const remaining = required - paid;
    if (remaining >= 0 && (formData.requiredAmount || formData.paidAmount)) {
      setFormData(prev => ({ ...prev, remainingAmount: remaining.toString() }));
    }
  }, [formData.requiredAmount, formData.paidAmount]);

  const isInstallment = formData.paymentType === 'installment' || formData.paymentType === 'cash_installment';

  const [unitSearch, setUnitSearch] = useState(() => {
    if (!deal) return '';
    const u = unitsList.find((u: any) => (u._id || u.id) === dealUnitId);
    if (u) return `${u.unitCode}${u.type ? ` - ${u.type}` : ''}${u.price ? ` (${u.price.toLocaleString()} EGP)` : ''}`;
    return dealUnitCode || '';
  });

  const filteredUnits = unitsList.filter((u: any) => {
    const label = `${u.unitCode}${u.type ? ` - ${u.type}` : ''}${u.price ? ` (${u.price.toLocaleString()} EGP)` : ''}`.toLowerCase();
    return label.includes(unitSearch.toLowerCase());
  });

  // Agent search state
  const [agentSearch, setAgentSearch] = useState(() => {
    if (!deal) return '';
    const a = usersList.find((a: any) => (a._id || a.id) === dealAgentId);
    return a ? (a.fullName || a.name) : dealAgentName || '';
  });

  const filteredAgents = usersList.filter((a: any) => {
    const name = (a.fullName || a.name || '').toLowerCase();
    return name.includes(agentSearch.toLowerCase());
  });

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
        triggerToast(
          deal ? (isAr ? 'تم التحديث ✅' : 'Updated ✅') : (isAr ? 'تمت الإضافة 🚀' : 'Created 🚀'),
          'success'
        );
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
      createDeal.mutate({
        title:      formData.title,
        client:     formData.client,
        unit:       formData.unit,
        value:      Number(formData.value),
        salesAgent: formData.salesAgent,
        paymentType: formData.paymentType,
        ...(isInstallment && {
          paidAmount:      Number(formData.paidAmount)      || undefined,
          remainingAmount: Number(formData.remainingAmount) || undefined,
          requiredAmount:  Number(formData.requiredAmount)  || undefined,
        }),
        notes: formData.notes || undefined,
      }, options);

    } else if (editMode === 'full') {
      const payload = {
        title:       formData.title,
        client:      formData.client,
        unit:        formData.unit,
        value:       Number(formData.value),
        salesAgent:  formData.salesAgent,
        paymentType: formData.paymentType,
        requiredAmount: Number(formData.requiredAmount) || undefined,
        ...(isInstallment && {
          paidAmount:      Number(formData.paidAmount)      || undefined,
          remainingAmount: Number(formData.remainingAmount) || undefined,
        }),
        notes: formData.notes || undefined,
      };
      console.log('🔍 full update payload:', JSON.stringify(payload));
      updateDeal.mutate({ id: deal._id || deal.id, data: payload }, options);
    }
  };

  const isPending = createDeal.isPending || updateDeal.isPending || updateDealStatus.isPending;

  const locked = (field: 'status' | 'other'): boolean => {
    if (!deal) return false;
    if (editMode === 'view')   return true;
    if (editMode === 'status') return field !== 'status';
    return false;
  };

  const inputCls = (field: 'status' | 'other') =>
    locked(field)
      ? 'w-full px-4 py-2 border border-[#E5E5E5] rounded-lg bg-[#F7F7F7] text-[#555] cursor-not-allowed'
      : 'w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]';

  const selectCls = (field: 'status' | 'other') =>
    locked(field)
      ? 'w-full px-4 py-2 border border-[#E5E5E5] rounded-lg bg-[#F7F7F7] text-[#555] cursor-not-allowed'
      : 'w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] bg-white';

  const T = (ar: string, en: string) => isAr ? ar : en;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>

        {/* Header */}
        <div className={`sticky top-0 bg-white border-b border-[#E5E5E5] px-6 py-4 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h2 className="font-bold text-[#16100A]">
              {!deal
                ? T('إنشاء صفقة جديدة', 'Create New Deal')
                : editMode === 'status' ? T('تعديل الحالة', 'Update Status')
                : editMode === 'full'   ? T('تعديل الصفقة', 'Edit Deal')
                :                        T('تفاصيل الصفقة', 'Deal Details')}
            </h2>
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

        {/* Prefill Banner */}
        {!deal && prefillClient && (
          <div className={`mx-6 mt-4 px-4 py-3 bg-[#FEF3E2] border border-[#B5752A]/30 rounded-lg flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="w-2 h-2 rounded-full bg-[#B5752A] flex-shrink-0" />
            <p className="text-sm text-[#B5752A] font-medium">
              {isAr ? `تم تعبئة العميل تلقائياً: ${prefillClient.fullName}` : `Client pre-filled: ${prefillClient.fullName}`}
            </p>
          </div>
        )}

        {/* Edit Mode Switcher */}
        {deal && (
          <div className={`px-6 pt-4 flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button type="button"
              disabled={isPending}
              onClick={() => setEditMode(editMode === 'status' ? 'view' : 'status')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                editMode === 'status' ? 'border-[#B5752A] bg-[#FEF3E2] text-[#B5752A]' : 'border-[#E5E5E5] text-[#555] hover:bg-[#F7F7F7]'
              } ${isRTL ? 'flex-row-reverse' : ''}`}>
              <RefreshCw className={`w-4 h-4 ${isPending && editMode === 'status' ? 'animate-spin' : ''}`} />
              {T('تعديل الحالة', 'Update Status')}
            </button>
            <button type="button"
              disabled={isPending}
              onClick={() => setEditMode(editMode === 'full' ? 'view' : 'full')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                editMode === 'full' ? 'border-[#B5752A] bg-[#FEF3E2] text-[#B5752A]' : 'border-[#E5E5E5] text-[#555] hover:bg-[#F7F7F7]'
              } ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Pencil className="w-4 h-4" />
              {T('تعديل التفاصيل', 'Edit Details')}
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">

          {/* ── VIEW MODE: عرض البيانات كـ text ─────────────────────────────── */}
          {deal && editMode === 'view' ? (
            <div className="space-y-0 divide-y divide-[#F0F0F0]">
              {[
                { label: T('عنوان الصفقة', 'Deal Title'),       value: deal.title },
                { label: T('العميل', 'Client'),                  value: (() => {
                    const c = clientsList.find((c: any) => (c._id || c.id) === getId(deal.client));
                    return c ? (c.fullName || c.name || c.email) : (typeof deal.client === 'object' ? (deal.client?.fullName || deal.client?.name) : deal.client) || '—';
                  })()
                },
                { label: T('الوحدة', 'Unit'),                    value: (() => {
                    const u = unitsList.find((u: any) => (u._id || u.id) === dealUnitId);
                    if (u) return `${u.unitCode}${u.type ? ` - ${u.type}` : ''}${u.price ? ` (${u.price.toLocaleString()} EGP)` : ''}`;
                    if (dealUnitCode) return dealUnitCode;
                    return '—';
                  })()
                },
                { label: T('قيمة الصفقة', 'Deal Value'),         value: deal.value ? `${Number(deal.value).toLocaleString()} EGP` : '—' },
                { label: T('مندوب المبيعات', 'Sales Agent'),      value: (() => {
                    const a = usersList.find((a: any) => (a._id || a.id) === dealAgentId);
                    return a ? (a.fullName || a.name) : dealAgentName || '—';
                  })()
                },
                { label: T('حالة الصفقة', 'Deal Status'),         value: isAr ? (STATUS_LABELS[deal.status]?.ar || deal.status) : (STATUS_LABELS[deal.status]?.en || deal.status), badge: STATUS_LABELS[deal.status]?.color },
                { label: T('طريقة الدفع', 'Payment Type'),        value: isAr ? (PAYMENT_LABELS[deal.paymentType?.toLowerCase() || '']?.ar || deal.paymentType) : (PAYMENT_LABELS[deal.paymentType?.toLowerCase() || '']?.en || deal.paymentType) || '—' },
                { label: T('المبلغ المطلوب', 'Required Amount'),    value: deal.requiredAmount ? `${Number(deal.requiredAmount).toLocaleString()} EGP` : '—' },
                ...(isInstallment ? [
                  { label: T('المبلغ المدفوع', 'Paid Amount'),       value: deal.paidAmount != null ? `${Number(deal.paidAmount).toLocaleString()} EGP` : '—' },
                  { label: T('المبلغ المتبقي', 'Remaining Amount'),  value: deal.remainingAmount != null ? `${Number(deal.remainingAmount).toLocaleString()} EGP` : '—' },
                ] : []),
                ...(deal.notes ? [{ label: T('ملاحظات', 'Notes'), value: deal.notes }] : []),
              ].map(({ label, value, badge }) => (
                <div key={label} className={`flex items-start justify-between py-3 gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-sm text-[#888] flex-shrink-0 w-36">{label}</span>
                  {badge ? (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge}`}>{value}</span>
                  ) : (
                    <span className={`text-sm font-medium text-[#16100A] ${isRTL ? 'text-right' : 'text-left'} flex-1`}>{value as string}</span>
                  )}
                </div>
              ))}
            </div>

          ) : (
          /* ── EDIT / CREATE MODE: الـ inputs ─────────────────────────────── */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Title — مش في status mode */}
            {editMode !== 'status' && (
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {T('عنوان الصفقة', 'Deal Title')} {!deal && '*'}
              </label>
              <input type="text" value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]"
                placeholder={T('مثال: بيع فيلا B1-034', 'e.g., Villa B1-034 Sale')}
                required={!deal}
              />
            </div>
            )}

            {/* Client */}
            {editMode !== 'status' && (
              <div>
                <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {T('العميل', 'Client')} {!deal && '*'}
                </label>
                <select value={formData.client}
                  onChange={e => setFormData({ ...formData, client: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] bg-white"
                  required={!deal}
                >
                  <option value="">{isClientsLoading ? T('جاري التحميل...', 'Loading...') : T('اختر العميل', 'Select Client')}</option>
                  {clientsList.map((c: any) => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.fullName || c.name || c.email}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Unit — search + select */}
            {editMode !== 'status' && (
              <div>
                <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {T('الوحدة', 'Unit')} {!deal && '*'}
                </label>
                <input
                  type="text"
                  value={unitSearch}
                  onChange={e => setUnitSearch(e.target.value)}
                  placeholder={T('ابحث عن وحدة...', 'Search unit...')}
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg rounded-b-none border-b-0 focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm"
                />
                <select
                  value={formData.unit}
                  onChange={e => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg rounded-t-none focus:outline-none focus:ring-2 focus:ring-[#B5752A] bg-white"
                  required={!deal}
                  size={Math.min(filteredUnits.length + 1, 5)}
                >
                  <option value="">{isUnitsLoading ? T('جاري التحميل...', 'Loading...') : T('اختر الوحدة', 'Select Unit')}</option>
                  {filteredUnits.map((u: any) => (
                    <option key={u._id || u.id} value={u._id || u.id}>
                      {u.unitCode}{u.type ? ` - ${u.type}` : ''}{u.price ? ` (${u.price.toLocaleString()} EGP)` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Value */}
            {editMode !== 'status' && (
              <div>
                <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {T('قيمة الصفقة (EGP)', 'Deal Value (EGP)')} {!deal && '*'}
                </label>
                <input type="number" value={formData.value}
                  onChange={e => setFormData({ ...formData, value: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]"
                  placeholder="8500000"
                  required={!deal}
                />
              </div>
            )}

            {/* Sales Agent — search + select */}
            {editMode !== 'status' && (
              <div>
                <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {T('مندوب المبيعات', 'Sales Agent')} {!deal && '*'}
                </label>
                <input
                  type="text"
                  value={agentSearch}
                  onChange={e => setAgentSearch(e.target.value)}
                  placeholder={isUsersLoading ? T('جاري التحميل...', 'Loading...') : T('ابحث عن مندوب...', 'Search agent...')}
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg rounded-b-none border-b-0 focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm"
                />
                <select
                  value={formData.salesAgent}
                  onChange={e => setFormData({ ...formData, salesAgent: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg rounded-t-none focus:outline-none focus:ring-2 focus:ring-[#B5752A] bg-white"
                  required={!deal}
                  size={Math.min(filteredAgents.length + 1, 5)}
                >
                  <option value="">{T('اختر المندوب', 'Select Agent')}</option>
                  {filteredAgents.map((a: any) => (
                    <option key={a._id || a.id} value={a._id || a.id}>
                      {a.fullName || a.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status — يظهر بس في status mode أو create */}
            {(editMode === 'status' || !deal) && (
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {T('حالة الصفقة', 'Deal Status')} *
                </label>
                <select value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] bg-white"
                  required
                >
                  {statuses.map(s => (
                    <option key={s} value={s}>
                      {isAr ? (STATUS_LABELS[s]?.ar || s) : (STATUS_LABELS[s]?.en || s)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Payment Type */}
            {editMode !== 'status' && (
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {T('طريقة الدفع', 'Payment Type')} {!deal && '*'}
                </label>
                <select value={formData.paymentType}
                  onChange={e => setFormData({ ...formData, paymentType: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] bg-white"
                  required={!deal}
                >
                  {Object.entries(PAYMENT_LABELS).map(([val, lb]) => (
                    <option key={val} value={val}>{isAr ? lb.ar : lb.en}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Paid + Remaining — تقسيط فقط */}
            {editMode !== 'status' && isInstallment && (
              <>
                <div>
                  <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {T('المبلغ المدفوع (EGP)', 'Paid Amount (EGP)')}
                  </label>
                  <input type="number" value={formData.paidAmount}
                    onChange={e => setFormData({ ...formData, paidAmount: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {T('المبلغ المتبقي (EGP)', 'Remaining Amount (EGP)')}
                  </label>
                  <input type="number" value={formData.remainingAmount} readOnly
                    className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg bg-[#F7F7F7] text-[#555] cursor-not-allowed"
                    placeholder="0"
                  />
                </div>
              </>
            )}

            {/* Required Amount — دايماً ظاهر */}
            {editMode !== 'status' && (
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {T('المبلغ المطلوب (EGP)', 'Required Amount (EGP)')}
                </label>
                <input type="number" value={formData.requiredAmount}
                  onChange={e => setFormData({ ...formData, requiredAmount: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]"
                  placeholder="1500000"
                />
              </div>
            )}

            {/* Notes */}
            {editMode !== 'status' && (
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {T('ملاحظات', 'Notes')}
                </label>
                <textarea value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] min-h-[100px]"
                  placeholder={T('أضف أي ملاحظات إضافية...', 'Add any additional notes...')}
                />
              </div>
            )}
          </div>
          )}

          {/* Footer */}
          <div className={`flex items-center justify-end gap-3 mt-8 pt-6 border-t border-[#E5E5E5] ${isRTL ? 'flex-row-reverse' : ''}`}>
            {deal && (
              <button type="button" onClick={() => setShowDeleteConfirm(true)}
                disabled={isPending}
                className={`px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${isRTL ? 'ml-auto' : 'mr-auto'}`}>
                {T('حذف الصفقة', 'Delete Deal')}
              </button>
            )}
            <button type="button" onClick={onClose}
              disabled={isPending}
              className="px-6 py-2 border border-[#E5E5E5] rounded-lg text-[#555] hover:bg-[#F7F7F7] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {T('إلغاء', 'Cancel')}
            </button>
            {(!deal || editMode !== 'view') && (
              editMode === 'status' ? (
                <button type="button"
                  disabled={isPending || !isDirty}
                  onClick={() => {
                    updateDealStatus.mutate(
                      { id: deal!._id || deal!.id, status: formData.status },
                      {
                        onSuccess: () => {
                          triggerToast(isAr ? 'تم تحديث الحالة ✅' : 'Status updated ✅', 'success');
                          onSave?.(formData);
                          onClose();
                        },
                        onError: (err: any) => {
                          const msg = err.response?.data?.message;
                          triggerToast(Array.isArray(msg) ? msg[0] : msg || (isAr ? 'خطأ' : 'Error'), 'error');
                        },
                      }
                    );
                  }}
                  className="px-6 py-2 gradient-primary text-white rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  {updateDealStatus.isPending
                    ? <span className="flex items-center gap-2">{T('جاري الحفظ', 'Saving')} <span className="animate-spin">⟳</span></span>
                    : T('حفظ', 'Save')}
                </button>
              ) : (
                <button type="submit"
                  disabled={isPending || (!!deal && !isDirty)}
                  className="px-6 py-2 gradient-primary text-white rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  {isPending
                    ? <span className="flex items-center gap-2">{T('جاري الحفظ', 'Saving')} <span className="animate-spin">⟳</span></span>
                    : T('حفظ', 'Save')}
                </button>
              )
            )}
          </div>
        </form>
      </div>

      {/* Confirm Delete */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <X className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-[#16100A] mb-2">{T('حذف الصفقة؟', 'Delete Deal?')}</h3>
              <p className="text-[#555] text-sm mb-6">{T('هل أنت متأكد؟ لا يمكن التراجع.', 'Are you sure? This cannot be undone.')}</p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-[#E5E5E5] rounded-lg text-[#555] hover:bg-[#F7F7F7] font-medium transition-colors">
                  {T('إلغاء', 'Cancel')}
                </button>
                <button onClick={handleDelete} disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold transition-colors disabled:opacity-50">
                  {deleteMutation.isPending ? '...' : T('حذف', 'Delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}