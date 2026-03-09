import { useState } from 'react';
import { Plus, User as UserIcon, Building2, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../store/useConfigStore';
import { useAuthStore } from '../../store/useAuthStore';
import { DealModal } from './components/DealModal';
import { ImageWithFallback } from './components/ImageWithFallback';
import { useDeals } from './hooks/useDeals';
import { useDealsSummary } from './hooks/useDealsSummary';

interface StageConfig {
  id: string;
  backend: string;
  color: string;
}

const stages: StageConfig[] = [
  { id: 'New Deal',     backend: 'NEW',         color: 'bg-blue-500'   },
  { id: 'Negotiation',  backend: 'NEGOTIATION',  color: 'bg-purple-500' },
  { id: 'Reservation',  backend: 'RESERVATION',  color: 'bg-orange-500' },
  { id: 'Closed Won',   backend: 'CLOSED_WON',   color: 'bg-green-500'  },
  { id: 'Closed Lost',  backend: 'CLOSED_LOST',  color: 'bg-gray-500'   },
];

const DEALS_PER_STAGE = 3;

const paymentTypeLabel = (type: string, ar: boolean) => {
  if (type === 'CASH')        return ar ? 'كاش'          : 'Cash';
  if (type === 'INSTALLMENT') return ar ? 'تقسيط'        : 'Installment';
  return ar ? 'كاش وتقسيط' : 'Cash & Installment';
};

const paymentTypeColor = (type: string) => {
  if (type === 'CASH')        return 'bg-green-100 text-green-700';
  if (type === 'INSTALLMENT') return 'bg-blue-100 text-blue-700';
  return 'bg-purple-100 text-purple-700';
};

export default function Deals() {
  const [modalOpen, setModalOpen]     = useState(false);
  const [editingDeal, setEditingDeal] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [stagePages, setStagePages]   = useState<Record<string, number>>(
    Object.fromEntries(stages.map(s => [s.backend, 1]))
  );

  const { t, i18n }                    = useTranslation(['deals', 'common']);
  const { dir }                        = useConfigStore();
  const { user }                       = useAuthStore();
  const { data: dealsData, isLoading } = useDeals(currentPage);
  const { data: summaryData }          = useDealsSummary();

  const deals      = Array.isArray(dealsData?.data) ? dealsData.data : [];
  const pagination = dealsData?.pagination;

  const isRTL   = dir === 'rtl';
  const language = i18n.language;
  const canEdit  = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'sales';

  const handleAddDeal  = () => { setEditingDeal(null); setModalOpen(true); };
  const handleEditDeal = (deal: any) => { setEditingDeal(deal); setModalOpen(true); };

  const getDealsByStage  = (backend: string) => deals.filter((d: any) => d.status === backend);
  const getVisibleDeals  = (backend: string) => {
    const all  = getDealsByStage(backend);
    const page = stagePages[backend] || 1;
    return all.slice(0, page * DEALS_PER_STAGE);
  };
  const loadMoreInStage  = (backend: string) =>
    setStagePages(prev => ({ ...prev, [backend]: (prev[backend] || 1) + 1 }));

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B5752A]" />
      </div>
    );
  }

  return (
    <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h1 className="text-2xl font-bold text-[#16100A] mb-1">{t('deals.pipeline')}</h1>
          <p className="text-[#555555]">{t('deals.pipelineSubtitle')}</p>
        </div>
        <button
          onClick={handleAddDeal}
          className={`flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <Plus className="w-5 h-5" />
          {t('deals.newDeal')}
        </button>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {stages.map((stage) => {
          const summary = summaryData?.data || summaryData;
          const stats   = summary?.[stage.backend] || { count: 0, totalValue: { value: 0, unit: 'M' } };
          const val     = Number(stats.totalValue?.value || 0);
          const unit    = stats.totalValue?.unit || 'M';
          const finalM  = val > 1000 ? val / 1000000 : unit === 'K' ? val / 1000 : val;

          return (
            <div key={stage.id} className="bg-white p-4 border border-[#E5E5E5] rounded-lg shadow-sm">
              <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                <span className="text-sm font-medium text-[#555555]">{t(`dealStage.${stage.id}`)}</span>
              </div>
              <p className="text-2xl font-bold text-[#16100A] mb-1">{stats.count || 0}</p>
              <p className="text-xs text-[#555555]" dir="ltr">{finalM.toFixed(1)} M EGP</p>
            </div>
          );
        })}
      </div>

      {/* Pipeline Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stages.map((stage) => {
          const allStageDeals = getDealsByStage(stage.backend);
          const visibleDeals  = getVisibleDeals(stage.backend);
          const hasMore       = visibleDeals.length < allStageDeals.length;

          return (
            <div key={stage.id} className="flex flex-col">
              {/* Stage Header */}
              <div className="bg-white rounded-lg border border-[#E5E5E5] p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                    <h3 className="font-bold text-[#16100A]">{t(`dealStage.${stage.id}` as any)}</h3>
                  </div>
                  <span className="text-sm font-medium text-[#555555]">{allStageDeals.length}</span>
                </div>
              </div>

              {/* Deal Cards */}
              <div className="space-y-3">
                {visibleDeals.map((deal: any) => (
                  <div
                    key={deal._id || deal.id}
                    className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => canEdit && handleEditDeal(deal)}
                  >
                    {/* Image */}
                    {deal.unit?.images?.[0] ? (
                      <div className="h-40 overflow-hidden">
                        <ImageWithFallback
                          src={deal.unit.images[0]}
                          alt={deal.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-40 bg-gradient-to-br from-[#F7F4EF] to-[#EDE8DF] flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-[#B5752A]/40" />
                      </div>
                    )}

                    <div className="p-4 space-y-2">
                      {/* Title */}
                      <h4 className={`font-bold text-[#16100A] line-clamp-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {deal.title}
                      </h4>

                      {/* Client / Unit / Date */}
                      <div className="space-y-1.5">
                        <div className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <UserIcon className="w-4 h-4 flex-shrink-0" />
                          <span className="line-clamp-1">
                            {typeof deal.client === 'object'
                              ? (deal.client?.fullName || deal.client?.name || '—')
                              : (deal.client || '—')}
                          </span>
                        </div>
                        <div className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Building2 className="w-4 h-4 flex-shrink-0" />
                          <span className="line-clamp-1">
                            {deal.unit?.unitCode
                              ? `${deal.unit.unitCode}${deal.unit.project?.name ? ', ' + deal.unit.project.name : ''}`
                              : '—'}
                          </span>
                        </div>
                        <div className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span dir="ltr">
                            {deal.createdAt
                              ? new Date(deal.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')
                              : '—'}
                          </span>
                        </div>
                      </div>

                      {/* Deal Value */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#E5E5E5]">
                        <span className="text-sm text-[#555555]">
                          {language === 'ar' ? 'قيمة الصفقة' : 'Deal Value'}
                        </span>
                        <span className="font-bold text-[#B5752A]" dir="ltr">
                          {(deal.value || 0).toLocaleString()} EGP
                        </span>
                      </div>

                      {/* Sales Agent */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#555555]">
                          {language === 'ar' ? 'المندوب' : 'Sales Agent'}
                        </span>
                        <span className="text-sm font-semibold text-[#16100A] line-clamp-1 text-end">
                          {deal.salesAgent?.fullName || deal.salesAgent?.name || '—'}
                        </span>
                      </div>

                      {/* Payment Type */}
                      {deal.paymentType && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#555555]">
                            {language === 'ar' ? 'طريقة الدفع' : 'Payment Type'}
                          </span>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${paymentTypeColor(deal.paymentType)}`}>
                            {paymentTypeLabel(deal.paymentType, language === 'ar')}
                          </span>
                        </div>
                      )}

                      {/* Paid / Remaining */}
                      {(deal.paidAmount != null || deal.remainingAmount != null) && (
                        <div className="space-y-1 pt-2 border-t border-[#E5E5E5]">
                          {deal.paidAmount != null && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-[#555555]">
                                {language === 'ar' ? 'المدفوع' : 'Paid Amount'}
                              </span>
                              <span className="text-sm font-semibold text-green-600" dir="ltr">
                                {Number(deal.paidAmount).toLocaleString()} EGP
                              </span>
                            </div>
                          )}
                          {deal.remainingAmount != null && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-[#555555]">
                                {language === 'ar' ? 'المتبقي' : 'Remaining Amount'}
                              </span>
                              <span className="text-sm font-semibold text-red-500" dir="ltr">
                                {Number(deal.remainingAmount).toLocaleString()} EGP
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Notes */}
                      {deal.notes && (
                        <div className="pt-2 border-t border-[#E5E5E5]">
                          <p className="text-xs text-[#555555] mb-0.5">
                            {language === 'ar' ? 'ملاحظات' : 'Notes'}
                          </p>
                          <p className={`text-xs text-[#16100A] line-clamp-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {deal.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Load More */}
                {hasMore && (
                  <button
                    onClick={() => loadMoreInStage(stage.backend)}
                    className="w-full py-2 text-sm text-[#B5752A] font-medium bg-white border border-[#B5752A]/30 rounded-lg hover:bg-[#FEF3E2] transition-colors"
                  >
                    {language === 'ar' ? 'عرض المزيد' : 'Load More'}
                  </button>
                )}

                {allStageDeals.length === 0 && (
                  <div className="bg-[#F7F7F7] rounded-lg border-2 border-dashed border-[#E5E5E5] p-8 text-center">
                    <p className="text-sm text-[#555555]">{t('deals.noDealsinStage')}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Global Pagination */}
      {pagination && pagination.numberOfPages > 1 && (
        <div className={`flex items-center justify-center gap-2 mt-8 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border border-[#E5E5E5] text-sm font-medium text-[#555555] hover:bg-[#F7F7F7] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isRTL ? '›' : '‹'}
          </button>
          {Array.from({ length: pagination.numberOfPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${
                currentPage === page
                  ? 'gradient-primary text-white shadow-sm'
                  : 'border border-[#E5E5E5] text-[#555555] hover:bg-[#F7F7F7]'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage === pagination.numberOfPages}
            className="px-4 py-2 rounded-lg border border-[#E5E5E5] text-sm font-medium text-[#555555] hover:bg-[#F7F7F7] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isRTL ? '‹' : '›'}
          </button>
          <span className="text-xs text-[#555555] mx-2">
            {language === 'ar'
              ? `صفحة ${pagination.currentPage} من ${pagination.numberOfPages}`
              : `Page ${pagination.currentPage} of ${pagination.numberOfPages}`}
          </span>
        </div>
      )}

      {modalOpen && (
        <DealModal
          deal={editingDeal}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}