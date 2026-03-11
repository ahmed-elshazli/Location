import { User as UserIcon, Building2, Calendar } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { useConfigStore } from '../../../store/useConfigStore';
import { useTranslation } from 'react-i18next';

const paymentTypeLabel = (type: string, ar: boolean) => {
  const t = type?.toLowerCase();
  if (t === 'cash')             return ar ? 'كاش'         : 'Cash';
  if (t === 'installment')      return ar ? 'تقسيط'       : 'Installment';
  if (t === 'cash_installment') return ar ? 'كاش وتقسيط' : 'Cash & Installment';
  return type;
};

const paymentTypeStyle = (type: string) => {
  const t = type?.toLowerCase();
  if (t === 'cash')             return { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' };
  if (t === 'installment')      return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
  if (t === 'cash_installment') return { bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE' };
  return { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' };
};

const isInstallmentBased = (type: string) => {
  const t = type?.toLowerCase();
  return t === 'installment' || t === 'cash_installment';
};

interface DealCardProps {
  deal: any;
  onClick?: () => void;
  canEdit?: boolean;
}

export function DealCard({ deal, onClick, canEdit }: DealCardProps) {
  const { dir } = useConfigStore();
  const { i18n } = useTranslation();
  const isRTL   = dir === 'rtl';
  const language = i18n.language;
  const ar       = language === 'ar';

  const payStyle = paymentTypeStyle(deal.paymentType);

  return (
    <div
      className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer group"
      onClick={() => canEdit && onClick?.()}
    >
      {/* Image */}
      {deal.unit?.images?.[0] ? (
        <div className="h-44 overflow-hidden">
          <ImageWithFallback
            src={deal.unit.images[0]}
            alt={deal.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="h-44 bg-gradient-to-br from-[#F7F4EF] to-[#EDE8DF] flex items-center justify-center">
          <Building2 className="w-12 h-12 text-[#B5752A]/40" />
        </div>
      )}

      <div className="p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Title */}
        <h4 className={`font-bold text-[#16100A] text-base mb-3 line-clamp-1 ${isRTL ? 'text-right' : 'text-left'}`}>
          {deal.title}
        </h4>

        {/* Meta info */}
        <div className="space-y-2 mb-3">
          <div className={`flex items-center gap-2 text-sm text-[#666] ${isRTL ? 'flex-row-reverse' : ''}`}>
            <UserIcon className="w-4 h-4 flex-shrink-0 text-[#B5752A]" />
            <span className="line-clamp-1">
              {typeof deal.client === 'object'
                ? (deal.client?.fullName || deal.client?.name || '—')
                : (deal.client || '—')}
            </span>
          </div>
          <div className={`flex items-center gap-2 text-sm text-[#666] ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Building2 className="w-4 h-4 flex-shrink-0 text-[#B5752A]" />
            <span className="line-clamp-1">
              {deal.unit?.unitCode
                ? `${deal.unit.unitCode}${deal.unit.project?.name ? ', ' + deal.unit.project.name : ''}`
                : '—'}
            </span>
          </div>
          <div className={`flex items-center gap-2 text-sm text-[#666] ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Calendar className="w-4 h-4 flex-shrink-0 text-[#B5752A]" />
            <span dir="ltr">
              {deal.createdAt
                ? new Date(deal.createdAt).toLocaleDateString(ar ? 'ar-EG' : 'en-US')
                : '—'}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#F0F0F0] my-3" />

        {/* Deal Value */}
        <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-sm text-[#888]">{ar ? 'قيمة الصفقة' : 'Deal Value'}</span>
          <span className="font-bold text-[#B5752A] text-sm" dir="ltr">
            {(deal.value || 0).toLocaleString()} EGP
          </span>
        </div>

        {/* Sales Agent */}
        <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-sm text-[#888]">{ar ? 'المندوب' : 'Sales Agent'}</span>
          <span className="text-sm font-semibold text-[#16100A] line-clamp-1 max-w-[55%] text-end">
            {deal.salesAgent?.fullName || deal.salesAgent?.name || '—'}
          </span>
        </div>

        {/* Payment Type */}
        {deal.paymentType && (
          <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-sm text-[#888]">{ar ? 'طريقة الدفع' : 'Payment Type'}</span>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full border"
              style={{ background: payStyle.bg, color: payStyle.text, borderColor: payStyle.border }}
            >
              {paymentTypeLabel(deal.paymentType, ar)}
            </span>
          </div>
        )}

        {/* Required Amount — دايمًا ظاهر */}
        {deal.requiredAmount != null && (
          <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-sm text-[#888]">{ar ? 'المبلغ المطلوب' : 'Required Amount'}</span>
            <span className="text-sm font-bold text-[#B5752A]" dir="ltr">
              {Number(deal.requiredAmount).toLocaleString()} EGP
            </span>
          </div>
        )}

        {/* Paid / Remaining — فقط للتقسيط */}
        {isInstallmentBased(deal.paymentType) && (
          <>
            <div className="border-t border-[#F0F0F0] my-3" />
            {deal.paidAmount != null && (
              <div className={`flex items-center justify-between mb-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-sm text-[#888]">{ar ? 'المبلغ المدفوع' : 'Paid Amount'}</span>
                <span className="text-sm font-bold text-green-600" dir="ltr">
                  {Number(deal.paidAmount).toLocaleString()} EGP
                </span>
              </div>
            )}
            {deal.remainingAmount != null && (
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-sm text-[#888]">{ar ? 'المبلغ المتبقي' : 'Remaining Amount'}</span>
                <span className="text-sm font-bold text-red-500" dir="ltr">
                  {Number(deal.remainingAmount).toLocaleString()} EGP
                </span>
              </div>
            )}
          </>
        )}

        {/* Notes */}
        {deal.notes && (
          <>
            <div className="border-t border-[#F0F0F0] my-3" />
            <p className="text-xs text-[#888] mb-1">{ar ? 'ملاحظات' : 'Notes'}</p>
            <p className={`text-xs text-[#444] line-clamp-2 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
              {deal.notes}
            </p>
          </>
        )}
      </div>
    </div>
  );
}