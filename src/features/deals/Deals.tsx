import { useState } from 'react'; 
import { Plus, User as UserIcon, Building2, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../store/useConfigStore';
import { useAuthStore } from '../../store/useAuthStore';
import { DealModal } from './components/DealModal';
import { ImageWithFallback } from './components/ImageWithFallback';
import { useDeals } from './hooks/useDeals';
import { useDealsSummary } from './hooks/useDealsSummary';

// ✅ 1. تحديث الـ IDs لتطابق الـ Enums في السيرفر بالضبط
interface StageConfig {
  id: string;      // ده اللي بنستخدمه في الترجمة (مثل "New Deal")
  backend: string; // ده اللي بنبعته وبنستلمه من السيرفر (مثل "NEW")
  color: string;   // ده للـ UI
}

// 2️⃣ تطبيق الـ Interface على المصفوفة
const stages: StageConfig[] = [
  { id: 'New Deal', backend: 'NEW', color: 'bg-blue-500' },
  { id: 'Negotiation', backend: 'NEGOTIATION', color: 'bg-purple-500' },
  { id: 'Reservation', backend: 'RESERVATION', color: 'bg-orange-500' },
  { id: 'Closed Won', backend: 'CLOSED_WON', color: 'bg-green-500' },
  { id: 'Closed Lost', backend: 'CLOSED_LOST', color: 'bg-gray-500' },
];

export default function Deals() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<any>(null);

  const { t, i18n } = useTranslation(['deals', 'common']); 
  const { dir } = useConfigStore(); 
  const { user } = useAuthStore();
  const { data: dealsData, isLoading } = useDeals();
  const { data: summaryData} = useDealsSummary();
  const deals = Array.isArray(dealsData) ? dealsData : (dealsData?.data || []);
  
  const isRTL = dir === 'rtl';
  const language = i18n.language;

  const canEdit = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'sales';

  const handleAddDeal = () => {
    setEditingDeal(null);
    setModalOpen(true);
  };

  const mapUiToBackendStatus = (uiId: string) => {
    const mapping: Record<string, string> = {
      'New Deal': 'NEW',
      'Negotiation': 'NEGOTIATION',
      'Reservation': 'RESERVATION',
      'Closed Won': 'CLOSED_WON',
      'Closed Lost': 'CLOSED_LOST'
    };
    return mapping[uiId] || uiId;
  };

  const handleEditDeal = (deal: any) => {
    setEditingDeal(deal);
    setModalOpen(true);
  };

  // ✅ 2. تحديث الفلترة لتطابق الـ Status المبعوثة من السيرفر
  const getDealsByStage = (stageId: string) => {
    const targetStatus = mapUiToBackendStatus(stageId);
    return deals.filter((deal: any) => deal.status === targetStatus);
  };



  if (isLoading) {
    return <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B5752A]"></div>
      </div>
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
    // جلب بيانات السامري (المصدر الأدق للأرقام الإجمالية)
    const summary = summaryData?.data || summaryData;
    const stats = summary?.[stage.backend] || { count: 0, totalValue: { value: 0, unit: "M" } };
    
    return (
      <div key={stage.id} className="bg-white p-4 border border-[#E5E5E5] rounded-lg shadow-sm">
        <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`w-3 h-3 rounded-full ${stage.color}`} />
          <span className="text-sm font-medium text-[#555555]">{t(`dealStage.${stage.id}`)}</span>
        </div>
        
        {/* العدد الإجمالي الفعلي (الـ 7 والـ 6) */}
        <p className="text-2xl font-bold text-[#16100A] mb-1">{stats.count || 0}</p>
        
        <p className="text-xs text-[#555555]" dir="ltr">
          {(() => {
            // ✅ الـ Logic الذكي لعلاج تضارب الباك-إيند
            const val = Number(stats.totalValue?.value || 0);
            const unit = stats.totalValue?.unit || "M";
            let finalM: number;

            // لو الرقم أكبر من 1000، ده معناه إنه رقم خام (زي الـ 6 مليون) ومحتاج يتقسم
            if (val > 1000) {
              finalM = val / 1000000;
            } 
            // لو الرقم صغير وبالـ K (آلاف)، نقسمه على 1000 عشان يظهر كـ 0.1 M
            else if (unit === "K") {
              finalM = val / 1000;
            }
            // لو الرقم صغير وجنبه M، يبقى هو مبعوث جاهز (زي الـ 9.03)
            else {
              finalM = val;
            }

            return finalM.toFixed(1);
          })()} M EGP
        </p>
      </div>
    );
  })}
</div>

      {/* Pipeline Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stages.map((stage) => {
          const stageDeals = getDealsByStage(stage.id);
          
          return (
            <div key={stage.id} className="flex flex-col">
              <div className="bg-white rounded-lg border border-[#E5E5E5] p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                    <h3 className="font-bold text-[#16100A]">{t(`dealStage.${stage.id}` as any)}</h3>
                  </div>
                  <span className="text-sm font-medium text-[#555555]">{stageDeals.length}</span>
                </div>
              </div>

              <div className="space-y-3">
                {stageDeals.map((deal: any) => (
                  <div
                    key={deal._id || deal.id}
                    className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => canEdit && handleEditDeal(deal)}
                  >
                    <div className="h-32 overflow-hidden">
                      <ImageWithFallback 
                        src={deal.unit?.images?.[0] || deal.image} // ✅ استخدام 'unit' بدل 'property'
                        alt={deal.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="p-4">
                      <h4 className={`font-bold text-[#16100A] mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {deal.title}
                      </h4>

                      <div className="space-y-2 mb-3">
                        <div className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <UserIcon className="w-4 h-4 flex-shrink-0" />
                          {/* ✅ العميل بيجي 'string' حسب طلبك */}
                          <span>{deal.client || t('common:common.noName')}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Building2 className="w-4 h-4 flex-shrink-0" />
                          <span>{deal.unit?.unitCode || deal.unit?.area + ' m²'}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span dir="ltr">{new Date(deal.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                        </div>
                      </div>

                      {/* Price Section */}
                      <div className="flex items-center justify-between pt-3 border-t border-[#E5E5E5]">
                        <span className="text-sm text-[#555555]">{t('deals.value')}</span>
                        <span className="font-bold text-[#B5752A]" dir="ltr">
                          {(deal.value || 0).toLocaleString()} {language === 'ar' ? 'جنيه' : 'EGP'}
                        </span>
                      </div>

                      {/* Sales Agent */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E5E5E5]">
                        <span className="text-xs text-[#555555]">{t('deals.salesAgent')}</span>
                        <span className="text-xs font-medium text-[#16100A]">
                          {deal.salesAgent?.fullName || deal.salesAgent?.name || t('common:common.noName')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {stageDeals.length === 0 && (
                  <div className="bg-[#F7F7F7] rounded-lg border-2 border-dashed border-[#E5E5E5] p-8 text-center">
                    <p className="text-sm text-[#555555]">{t('deals.noDealsinStage')}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <DealModal
          deal={editingDeal}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}