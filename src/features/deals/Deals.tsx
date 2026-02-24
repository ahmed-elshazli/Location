import { useState } from 'react'; // ✅ مسحنا React لتجنب خطأ TS6133
import { Plus, User as UserIcon, Building2, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../store/useConfigStore';
import { useAuthStore } from '../../store/useAuthStore';
import { DealModal } from './components/DealModal';
import { ImageWithFallback } from './components/ImageWithFallback';

export interface Deal {
  id: string;
  title: string;
  titleAr?: string;
  client: string;
  clientAr?: string;
  property: string;
  propertyAr?: string;
  propertyName: string; // ✅ جعلناه مطابقاً لما طلبه الـ Compiler
  price: number;
status: 'New' | 'New Deal' | 'Negotiation' | 'Reservation' | 'Closed Won' | 'Closed Lost';  createdAt: string;
  salesAgent: string;
  salesAgentAr?: string;
  notes?: string;
  notesAr?: string;
  image?: string;
}

const mockDeals: Deal[] = [
  {
    id: '1',
    title: 'Villa B1-034 Sale',
    titleAr: 'بيع فيلا B1-034',
    client: 'Ahmed Khaled',
    clientAr: 'أحمد خالد',
    property: 'Villa B1-034, Madinaty',
    propertyAr: 'فيلا B1-034، مدينتي',
    propertyName: 'Villa B1-034', // ✅ تم الإضافة
    price: 8500000,
    salesAgent: 'Abdallah Elgamal',
    salesAgentAr: 'عبدالله الجمال',
    status: 'New Deal',
    createdAt: '2026-02-12',
    notes: 'Client interested in quick closing',
    notesAr: 'العميل مهتم بالإغلاق السريع',
    image: 'https://images.unsplash.com/photo-1679364297777-1db77b6199be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB2aWxsYSUyMGV4dGVyaW9yfGVufDF8fHx8MTc3MDg3Njc1MXww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '2',
    title: 'Apartment 45 Sale',
    titleAr: 'بيع شقة 45',
    client: 'Sarah Mohamed',
    clientAr: 'سارة محمد',
    property: 'Apartment 45, Rehab',
    propertyAr: 'شقة 45، الرحاب',
    propertyName: 'Apartment 45', // ✅ تم الإضافة
    price: 2500000,
    salesAgent: 'Esmaeil Mohamed',
    salesAgentAr: 'إسماعيل محمد',
    status: 'Negotiation',
    createdAt: '2026-02-11',
    notes: 'Negotiating payment plan',
    notesAr: 'التفاوض على خطة الدفع',
    image: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBidWlsZGluZ3xlbnwxfHx8fDE3NzA4MDgwMDd8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '3',
    title: 'Commercial Unit COM-012',
    titleAr: 'وحدة تجارية COM-012',
    client: 'Omar Business Group',
    clientAr: 'مجموعة عمر التجارية',
    property: 'COM-012, Thousand',
    propertyAr: 'COM-012، ألف',
    propertyName: 'COM-012', // ✅ تم الإضافة
    price: 5500000,
    salesAgent: 'Raghad',
    salesAgentAr: 'رغد',
    status: 'Negotiation',
    createdAt: '2026-02-10',
    image: 'https://images.unsplash.com/photo-1677324574457-645566fea332?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tZXJjaWFsJTIwYnVpbGRpbmclMjBvZmZpY2V8ZW58MXx8fHwxNzcwODIyMjE1fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '4',
    title: 'Apartment 78 Rent',
    titleAr: 'إيجار شقة 78',
    client: 'Fatima Hassan',
    clientAr: 'فاطمة حسن',
    property: 'Apartment 78, Rehab',
    propertyAr: 'شقة 78، الرحاب',
    propertyName: 'Apartment 78', // ✅ تم الإضافة
    price: 180000,
    salesAgent: 'Noha',
    salesAgentAr: 'نهى',
    status: 'Reservation',
    createdAt: '2026-02-09',
    notes: 'Annual rent contract',
    notesAr: 'عقد إيجار سنوي',
    image: 'https://images.unsplash.com/photo-1617000954880-ab96d29ce722?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcGFydG1lbnQlMjBjb21wbGV4JTIwYnVpbGRpbmd8ZW58MXx8fHwxNzcwODExODA3fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '5',
    title: 'Villa B3-023 Sale',
    titleAr: 'بيع فيلا B3-023',
    client: 'Youssef Ali',
    clientAr: 'يوسف علي',
    property: 'Villa B3-023, Madinaty',
    propertyAr: 'فيلا B3-023، مدينتي',
    propertyName: 'Villa B3-023', // ✅ تم الإضافة
    price: 9200000,
    salesAgent: 'Mohamed Elbaze',
    salesAgentAr: 'محمد الباز',
    status: 'Reservation',
    createdAt: '2026-02-08',
    image: 'https://images.unsplash.com/photo-1622015663381-d2e05ae91b72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB2aWxsYSUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NzA4NDAyNTR8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '6',
    title: 'Apartment 156 Sale',
    titleAr: 'بيع شقة 156',
    client: 'Nour Ahmed',
    clientAr: 'نور أحمد',
    property: 'Apartment 156, Celia',
    propertyAr: 'شقة 156، سيليا',
    propertyName: 'Apartment 156', // ✅ تم الإضافة
    price: 3200000,
    salesAgent: 'Abdallah Elgamal',
    salesAgentAr: 'عبدالله الجمال',
    status: 'Closed Won',
    createdAt: '2026-02-05',
    image: 'https://images.unsplash.com/photo-1763478959183-136fe6bdcc93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNpZGVudGlhbCUyMHByb3BlcnR5JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzcwNzg4MDY5fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '7',
    title: 'Villa B6-078 Sale',
    titleAr: 'بيع فيلا B6-078',
    client: 'Hassan Ibrahim',
    clientAr: 'حسن إبراهيم',
    property: 'Villa B6-078, Madinaty',
    propertyAr: 'فيلا B6-078، مدينتي',
    propertyName: 'Villa B6-078', // ✅ تم الإضافة
    price: 11000000,
    salesAgent: 'Esmaeil Mohamed',
    salesAgentAr: 'إسماعيل محمد',
    status: 'Closed Won',
    createdAt: '2026-02-03',
    image: 'https://images.unsplash.com/photo-1611094016919-36b65678f3d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjByZWFsJTIwZXN0YXRlJTIwcHJvcGVydHl8ZW58MXx8fHwxNzcwODkxMzg5fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '8',
    title: 'Apartment 92 Sale',
    titleAr: 'بيع شقة 92',
    client: 'Layla Mohamed',
    clientAr: 'ليلى محمد',
    property: 'Apartment 92, Sharm Bay',
    propertyAr: 'شقة 92، شرم باي',
    propertyName: 'Apartment 92', // ✅ تم الإضافة
    price: 1800000,
    salesAgent: 'Raghad',
    salesAgentAr: 'رغد',
    status: 'Closed Lost',
    createdAt: '2026-02-01',
    notes: 'Client found alternative',
    notesAr: 'العميل وجد بديل',
    image: 'https://images.unsplash.com/photo-1627141234469-24711efb373c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNpZGVudGlwaG90by0xNjI3MTQxMjM0NDY5LTI0NzExZWZiMzczYw&ixlib=rb-4.1.0&q=80&w=1080'
  },
];

const stages = [
  { id: 'New Deal', color: 'bg-blue-500' },
  { id: 'Negotiation', color: 'bg-purple-500' },
  { id: 'Reservation', color: 'bg-orange-500' },
  { id: 'Closed Won', color: 'bg-green-500' },
  { id: 'Closed Lost', color: 'bg-gray-500' },
];

export default function Deals() { // ✅ استخدمنا Default Export لـ Lazy Loading
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const { t, i18n } = useTranslation(['deals', 'common']); 
  const { dir } = useConfigStore(); 
  const { user } = useAuthStore();
  
  const isRTL = dir === 'rtl';
  const language = i18n.language;

  const canEdit = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'sales';
  const handleAddDeal = () => {
    setEditingDeal(null);
    setModalOpen(true);
  };

  const handleEditDeal = (deal: Deal) => {
    setEditingDeal(deal);
    setModalOpen(true);
  };

  const getDealsByStage = (stageId: string) => {
    return mockDeals.filter(deal => deal.status === stageId);
  };

  const calculateStageTotal = (stageId: string) => {
    return getDealsByStage(stageId).reduce((sum, deal) => sum + deal.price, 0);
  };
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
          const deals = getDealsByStage(stage.id);
          const total = calculateStageTotal(stage.id);
          
          return (
            <div key={stage.id} className="bg-white rounded-lg border border-[#E5E5E5] p-4">
              <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                <span className="text-sm font-medium text-[#555555]">{t(`dealStage.${stage.id}` as any)}</span>
              </div>
              <p className="text-2xl font-bold text-[#16100A] mb-1">{deals.length}</p>
              <p className="text-xs text-[#555555]" dir="ltr">{(total / 1000000).toFixed(1)} {language === 'ar' ? 'مليون جنيه' : 'M EGP'}</p>
            </div>
          );
        })}
      </div>

      {/* Pipeline Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stages.map((stage) => {
          const deals = getDealsByStage(stage.id);
          
          return (
            <div key={stage.id} className="flex flex-col">
              {/* Stage Header */}
              <div className="bg-white rounded-lg border border-[#E5E5E5] p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                    <h3 className="font-bold text-[#16100A]">{t(`dealStage.${stage.id}` as any)}</h3>
                  </div>
                  <span className="text-sm font-medium text-[#555555]">{deals.length}</span>
                </div>
              </div>

              {/* Stage Deals */}
              <div className="space-y-3">{deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => canEdit && handleEditDeal(deal)}
                  >
                    {/* Property Image */}
                    <div className="h-32 overflow-hidden">
                      <ImageWithFallback 
                        src={deal.image} 
                        alt={language === 'ar' ? deal.propertyAr : deal.property}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="p-4">
                      {/* Deal Title */}
                      <h4 className={`font-bold text-[#16100A] mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {language === 'ar' ? deal.titleAr : deal.title}
                      </h4>

                      {/* Deal Info */}
                      <div className="space-y-2 mb-3">
                        <div className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <UserIcon className="w-4 h-4 flex-shrink-0" />
                          <span>{language === 'ar' ? deal.clientAr : deal.client}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Building2 className="w-4 h-4 flex-shrink-0" />
                          <span>{language === 'ar' ? deal.propertyAr : deal.property}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span dir="ltr">{new Date(deal.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between pt-3 border-t border-[#E5E5E5]">
                        <span className="text-sm text-[#555555]">{t('deals.value')}</span>
                        <span className="font-bold text-[#B5752A]" dir="ltr">
                          {deal.price.toLocaleString()} {language === 'ar' ? 'جنيه' : 'EGP'}
                        </span>
                      </div>

                      {/* Sales Agent */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E5E5E5]">
                        <span className="text-xs text-[#555555]">{t('deals.salesAgent')}</span>
                        <span className="text-xs font-medium text-[#16100A]">{language === 'ar' ? deal.salesAgentAr : deal.salesAgent}</span>
                      </div>

                      {/* Notes */}
                      {deal.notes && (
                        <div className={`mt-3 pt-3 border-t border-[#E5E5E5] ${isRTL ? 'text-right' : 'text-left'}`}>
                          <p className="text-xs text-[#555555] mb-1">{t('common.notes')}</p>
                          <p className="text-xs text-[#16100A]">{language === 'ar' ? deal.notesAr : deal.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {deals.length === 0 && (
                  <div className="bg-[#F7F7F7] rounded-lg border-2 border-dashed border-[#E5E5E5] p-8 text-center">
                    <p className="text-sm text-[#555555]">{t('deals.noDealsinStage')}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Deal Modal */}
      {modalOpen && (
        <DealModal
          deal={editingDeal}
          onClose={() => setModalOpen(false)}
          onSave={() => {
            setModalOpen(false);
            // Handle save logic
          }}
        />
      )}
    </div>
  );
}