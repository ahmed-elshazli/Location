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

const DEALS_PER_STAGE = 3; // عدد الـ deals الظاهرة في كل عمود

export default function Deals() {
  const [modalOpen, setModalOpen]     = useState(false);
  const [editingDeal, setEditingDeal] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1); // ✅ pagination
  
  // ✅ عداد لكل stage لو عايز تعرض أكتر
  const [stagePages, setStagePages] = useState<Record<string, number>>(
    Object.fromEntries(stages.map(s => [s.backend, 1]))
  );

  const { t, i18n }                   = useTranslation(['deals', 'common']); 
  const { dir }                       = useConfigStore(); 
  const { user }                      = useAuthStore();
  const { data: dealsData, isLoading } = useDeals(currentPage);
  const { data: summaryData }         = useDealsSummary();

  // ✅ استخراج الداتا والـ pagination
  const deals      = Array.isArray(dealsData?.data) ? dealsData.data : [];
  const pagination = dealsData?.pagination;

  const isRTL   = dir === 'rtl';
  const language = i18n.language;
  const canEdit  = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'sales';

  const handleAddDeal  = () => { setEditingDeal(null); setModalOpen(true); };
  const handleEditDeal = (deal: any) => { setEditingDeal(deal); setModalOpen(true); };

  const getDealsByStage = (backend: string) =>
    deals.filter((deal: any) => deal.status === backend);

  // ✅ الـ deals الظاهرة في كل عمود بناءً على الـ stagePages
  const getVisibleDeals = (backend: string) => {
    const all  = getDealsByStage(backend);
    const page = stagePages[backend] || 1;
    return all.slice(0, page * DEALS_PER_STAGE);
  };

  const loadMoreInStage = (backend: string) => {
    setStagePages(prev => ({ ...prev, [backend]: (prev[backend] || 1) + 1 }));
  };

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
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h1 className="text-2xl font-bold text-[#16100A] mb-2">{t('deals.pipeline')}</h1>
            <p className="text-[#555555]">{t('deals.pipelineSubtitle')}</p>
          </div>
          <button
            onClick={handleAddDeal}
            className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all"
          >
            <Plus className="w-5 h-5" />
            {t('deals.newDeal')}
          </button>
        </div>
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
          const allStageDeals     = getDealsByStage(stage.backend);
          const visibleDeals      = getVisibleDeals(stage.backend);
          const hasMore           = visibleDeals.length < allStageDeals.length;

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
                    {/* ✅ الصورة بس لو موجودة */}
                    {deal.unit?.images?.[0] && (
                      <div className="h-32 overflow-hidden">
                        <ImageWithFallback
                          src={deal.unit.images[0]}
                          alt={deal.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* ✅ لو مفيش صورة، بنعرض placeholder بسيط */}
                    {!deal.unit?.images?.[0] && (
                      <div className="h-24 bg-gradient-to-br from-[#F7F4EF] to-[#EDE8DF] flex items-center justify-center">
                        <Building2 className="w-10 h-10 text-[#B5752A]/40" />
                      </div>
                    )}

                    <div className="p-4">
                      <h4 className={`font-bold text-[#16100A] mb-3 line-clamp-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {deal.title}
                      </h4>

                      <div className="space-y-2 mb-3">
                        {/* Client */}
                        <div className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <UserIcon className="w-4 h-4 flex-shrink-0" />
                          <span className="line-clamp-1">{deal.client || t('common:common.noName')}</span>
                        </div>

                        {/* Unit */}
                        <div className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Building2 className="w-4 h-4 flex-shrink-0" />
                          <span className="line-clamp-1">
                            {deal.unit?.unitCode || t('common:common.none')}
                          </span>
                        </div>

                        {/* Date */}
                        <div className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span dir="ltr">
                            {new Date(deal.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between pt-3 border-t border-[#E5E5E5]">
                        <span className="text-sm text-[#555555]">{t('deals.value')}</span>
                        <span className="font-bold text-[#B5752A]" dir="ltr">
                          {(deal.value || 0).toLocaleString()} {language === 'ar' ? 'جنيه' : 'EGP'}
                        </span>
                      </div>

                      {/* Sales Agent */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E5E5E5]">
                        <span className="text-xs text-[#555555]">{t('deals.salesAgent')}</span>
                        <span className="text-xs font-medium text-[#16100A] line-clamp-1">
                          {deal.salesAgent?.fullName || deal.salesAgent?.name || t('common:common.noName')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* ✅ Load More داخل الـ stage */}
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

      {/* ✅ Global Pagination - لو في أكتر من صفحة */}
      {pagination && pagination.numberOfPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
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
            {isRTL
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