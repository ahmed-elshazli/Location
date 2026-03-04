import React, { useState } from 'react';
// شلنا الـ User import القديم
import { 
  Plus, LayoutGrid, List, Search, Filter, Edit2, Trash2, 
  Building2, MapPin, DollarSign, Home, 
  TrendingUp
} from 'lucide-react';
import { useTranslation } from 'react-i18next'; // ✅ البديل الصحيح
import { useConfigStore } from '../../store/useConfigStore'; // ✅ لجلب الاتجاه
import { useAuthStore } from '../../store/useAuthStore'; // ✅ لجلب بيانات المستخدم
import { PropertyModal } from './components/PropertyModal';
import { ImageWithFallback } from './components/ImageWithFallback';
import { useUnits } from './hooks/useUnits';
import z from 'zod';
import { useToastStore } from '../../store/useToastStore';
import { useCreateUnit } from './hooks/useCreateUnit';
import { useDeleteUnit } from './hooks/useDeleteUnit';
import { useSellUnit } from './hooks/useSellUnit';



interface Property {
  _id: string;
  id?: string;
  title: string;
  project?: {
    _id: string;
    name: string;
  } | string;
  unitCode: string;
  floor?: number;
  apartment?: number;
  purpose: 'Sale' | 'Resale' | 'Rent' | 'Commercial';
  constructionStatus?: 'Ready' | 'Under Construction';
  type: 'Apartment' | 'Villa' | 'Commercial' | 'Leisure';
  area: string;
  villaZone?: string;
  phase?: string;
  developer: string;
  price: number;
  status: 'Available' | 'Reserved' | 'Sold';
  bedrooms?: number;
  bathrooms?: number;
  size: number;
}

export default function Properties() { // ✅ شلنا الـ Props
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPurpose, setFilterPurpose] = useState<string>('all');
  const [filterArea, setFilterArea] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // ✅ ربط المتغيرات بالسيستم الجديد
  const { t, i18n } = useTranslation('properties'); 
  const { dir } = useConfigStore(); 
  const { user } = useAuthStore();
  const { triggerToast } = useToastStore();
  const createUnit = useCreateUnit();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const deleteUnit = useDeleteUnit();
  const sellUnit = useSellUnit();
  
  const isRTL = dir === 'rtl'; // ✅ تعريف المتغير المستخدم في الـ UI
  const language = i18n.language; // ✅ تعريف المتغير المستخدم في الـ UI

  const isReadOnly = user?.role === 'sales'; // ✅ حماية الـ Logic
const { data: unitsData, isLoading } = useUnits();
  const unitList = Array.isArray(unitsData) ? unitsData : (unitsData?.data || []);


  const filteredProperties = unitList.filter((property: any) => {
  // تأمين القيم لتجنب أخطاء الـ Undefined
  const unitCode = property.unitCode?.toString().toLowerCase() || '';
  const area = property.area?.toLowerCase() || '';
  const type = property.type?.toLowerCase() || '';
  const searchTermLower = searchTerm.toLowerCase();

  const matchesSearch = 
    unitCode.includes(searchTermLower) ||
    area.includes(searchTermLower) ||
    type.includes(searchTermLower);
  
  const matchesType = filterType === 'all' || property.type === filterType;
  const matchesPurpose = filterPurpose === 'all' || property.purpose === filterPurpose;
  const matchesArea = filterArea === 'all' || property.area === filterArea;
  const matchesStatus = filterStatus === 'all' || property.status === filterStatus;

  return matchesSearch && matchesType && matchesPurpose && matchesArea && matchesStatus;
});


  const unitSchema = z.object({
  unitNumber: z.string().min(1, "رقم الوحدة مطلوب"),
  type: z.enum(['Apartment', 'Villa', 'Office', 'Studio']),
  price: z.string().min(1, "السعر مطلوب"),
  area: z.string().min(1, "المساحة مطلوبة"),
  project: z.string().nonempty("يجب اختيار مشروع"), // ✅ الـ MongoDB ID الخاص بالمشروع
  status: z.enum(['Available', 'Sold', 'Reserved']).default('Available'),
});


const [formData, setFormData] = useState({
  unitNumber: '',
  type: '',
  price: '',
  area: '',
  project: '',
  status: 'Available',
});

const closeModal = () => {
  setIsModalOpen(false); // قفل المودال
  setSelectedImages([]); // مسح الصور المختارة
  setFormData({          // إعادة تعيين الفورم للقيم الافتراضية
    unitNumber: '',
    type: 'Apartment',
    price: '',
    area: '',
    project: '',
    status: 'Available'
  });
};

// const handleSaveUnit = async (e: React.FormEvent) => {
//   e.preventDefault();
  
//   const validation = unitSchema.safeParse(formData);
//   if (!validation.success) {
//     triggerToast(validation.error.issues[0].message, 'error');
//     return;
//   }

//   const submissionData = new FormData();
  
//   // تجهيز البيانات للإرسال كـ multipart
//   Object.entries(formData).forEach(([key, value]) => {
//     submissionData.append(key, value as string);
//   });

//   // إضافة الصور لو موجودة
//   if (selectedImages) {
//     selectedImages.forEach((image) => submissionData.append('images', image));
//   }

//   createUnit.mutate(submissionData, {
//     onSuccess: () => {
//       triggerToast("تم إضافة الوحدة بنجاح 🏠", "success");
//       closeModal();
//     },
//     onError: (err: any) => {
//       const serverMsg = err.response?.data?.message;
//       triggerToast(Array.isArray(serverMsg) ? serverMsg[0] : serverMsg, 'error');
//     }
//   });
// };


  const handleAddProperty = () => {
    setEditingProperty(null);
    setModalOpen(true);
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setModalOpen(true);
  };

  const handleSellClick = (id: string, unitCode: string) => {
  if (window.confirm(`هل تريد تأكيد بيع الوحدة رقم "${unitCode}"؟`)) {
    sellUnit.mutate(id, {
      onSuccess: () => {
triggerToast(t('properties.successSell'), "success");
      },
      onError: (err: any) => {
triggerToast(err.response?.data?.message || t('common:common.error'), "error");
      }
    });
  }
};

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-50 text-green-700 border-green-200';
      case 'Reserved': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Sold': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handleDeleteUnit = (id: string, unitCode: string) => {
  // ✅ نافذة تأكيد بسيطة واحترافية
  if (window.confirm(`هل أنت متأكد من حذف الوحدة رقم "${unitCode}" نهائياً؟`)) {
    deleteUnit.mutate(id, {
      onSuccess: () => {
        triggerToast("تم حذف الوحدة بنجاح 🗑️", "success");
      },
      onError: (err: any) => {
        triggerToast(err.response?.data?.message || "فشل حذف الوحدة", "error");
      }
    });
  }
};

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B5752A]"></div>
      </div>
  }

  return (
    <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className={`mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
        <div className={`flex items-center gap-3 mb-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
          <Building2 className="w-8 h-8 text-[#B5752A]" />
          <h1 className="text-2xl font-bold text-[#16100A]">
            {t('properties.title')}
          </h1>
        </div>
        <p className="text-[#555555] mb-4">
          {t('properties.subtitle')}
        </p>
        
        {/* Action Button - positioned right/left based on direction */}
        {!isReadOnly && (
          <div className={`flex mb-4 ${isRTL ? 'justify-end' : 'justify-start'}`}>
            <button
              onClick={handleAddProperty}
              className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all"
            >
              <Plus className="w-5 h-5" />
              {t('properties.addProperty')}
            </button>
          </div>
        )}
      </div>

      {/* Search and Filters Section */}
<div className={`flex flex-col sm:flex-row gap-4 mb-6 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
  <div className="flex-1 relative">
    {/* Icon Position based on direction */}
    <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555] ${isRTL ? 'right-3' : 'left-3'}`} />
    <input
      type="text"
      placeholder={t('properties.searchPlaceholder')}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className={`w-full py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] ${
        isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    />
  </div>
  
  <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
    <button
      onClick={() => setShowFilters(!showFilters)}
      className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E5E5] rounded-lg hover:bg-[#F7F7F7] transition-all"
    >
      <Filter className="w-5 h-5 text-[#555555]" />
      <span className="text-sm font-medium">{t('properties.filters')}</span>
    </button>

    <div className="flex border border-[#E5E5E5] rounded-lg overflow-hidden">
      <button
        onClick={() => setViewMode('grid')}
        className={`px-3 py-2 transition-colors ${
          viewMode === 'grid' ? 'gradient-primary text-white' : 'bg-white text-[#555555] hover:bg-[#F7F7F7]'
        }`}
      >
        <LayoutGrid className="w-5 h-5" />
      </button>
      <button
        onClick={() => setViewMode('table')}
        className={`px-3 py-2 transition-colors border-l border-[#E5E5E5] ${
          viewMode === 'table' ? 'gradient-primary text-white' : 'bg-white text-[#555555] hover:bg-[#F7F7F7]'
        }`}
      >
        <List className="w-5 h-5" />
      </button>
    </div>
  </div>
</div>

{/* Filter Options - المصححة للسيرفر */}
{showFilters && (
  <div className="mb-6 p-4 bg-white border border-[#E5E5E5] rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Type Filter */}
      <div>
        <label className={`block text-xs font-semibold text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('properties.type')}
        </label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={`w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:ring-2 focus:ring-[#B5752A] outline-none ${isRTL ? 'text-right' : 'text-left'}`}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <option value="all">{t('properties.allTypes')}</option>
          {/* ✅ القيم الآن lowercase لتطابق السيرفر */}
          <option value="apartment">{t('properties.apartment')}</option>
          <option value="villa">{t('properties.villa')}</option>
          <option value="commercial">{t('properties.commercial')}</option>
          <option value="studio">{t('properties.studio')}</option>
        </select>
      </div>

      {/* Purpose Filter */}
      <div>
        <label className={`block text-xs font-semibold text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('properties.purpose')}
        </label>
        <select
          value={filterPurpose}
          onChange={(e) => setFilterPurpose(e.target.value)}
          className={`w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:ring-2 focus:ring-[#B5752A] outline-none ${isRTL ? 'text-right' : 'text-left'}`}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <option value="all">{t('properties.allPurposes')}</option>
          <option value="sale">{t('properties.sale')}</option>
          <option value="resale">{t('properties.resale')}</option>
          <option value="rent">{t('properties.rent')}</option>
          <option value="commercial">{t('properties.commercial')}</option>
        </select>
      </div>

      {/* Area Filter */}
      <div>
        <label className={`block text-xs font-semibold text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('properties.area')}
        </label>
        <select
          value={filterArea}
          onChange={(e) => setFilterArea(e.target.value)}
          className={`w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:ring-2 focus:ring-[#B5752A] outline-none ${isRTL ? 'text-right' : 'text-left'}`}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <option value="all">{t('properties.allAreas')}</option>
          <option value="Madinaty">{language === 'ar' ? 'مدينتي' : 'Madinaty'}</option>
          <option value="Rehab">{language === 'ar' ? 'الرحاب' : 'Rehab'}</option>
          <option value="Celia">{language === 'ar' ? 'سيليا' : 'Celia'}</option>
        </select>
      </div>

      {/* Status Filter */}
      <div>
        <label className={`block text-xs font-semibold text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('properties.status')}
        </label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={`w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:ring-2 focus:ring-[#B5752A] outline-none ${isRTL ? 'text-right' : 'text-left'}`}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <option value="all">{t('properties.allStatus')}</option>
          <option value="available">{t('properties.available')}</option>
          <option value="reserved">{t('properties.reserved')}</option>
          <option value="sold">{t('properties.sold')}</option>
        </select>
      </div>
    </div>
  </div>
)}
      
      {/* Properties Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProperties.map((property: any) => (
  <div key={property._id || property.id} className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden hover:shadow-lg transition-shadow" dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="h-48 overflow-hidden">
                <ImageWithFallback 
                  src={property.image} 
                  alt={`${t('properties.unit')} ${property.unitCode}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <h3 className="font-bold text-[#16100A] mb-1">{t('properties.unit')} {property.unitCode}</h3>
                    <p className="text-sm text-[#555555]">
                      {property.type === 'Apartment' && t('properties.apartment')}
                      {property.type === 'Villa' && t('properties.villa')}
                      {property.type === 'Commercial' && t('properties.commercial')}
                      {property.type === 'Leisure' && t('properties.leisure')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(property.status)} whitespace-nowrap`}>
                    {property.status === 'Available' && t('properties.available')}
                    {property.status === 'Reserved' && t('properties.reserved')}
                    {property.status === 'Sold' && t('properties.sold')}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-[#555555]">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>
                      {language === 'ar' ? (
                        property.area === 'Madinaty' ? 'مدينتي' :
                        property.area === 'Rehab' ? 'الرحاب' :
                        property.area === 'Celia' ? 'سيليا' :
                        property.area === 'Thousand' ? 'ألف مسكن' :
                        property.area === 'Sharm Bay' ? 'خليج شرم' : property.area
                      ) : property.area}
                      {property.phase && ` • ${property.phase}`}
                    </span>
                  </div>
                  {property.floor && property.apartment && (
                    <div className="flex items-center gap-2 text-sm text-[#555555]">
                      <Home className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {t('properties.floor')} {property.floor} • {t('properties.apt')} {property.apartment}
                      </span>
                    </div>
                  )}
                  {property.villaZone && (
                    <div className="flex items-center gap-2 text-sm text-[#555555]">
                      <Home className="w-4 h-4 flex-shrink-0" />
                      <span>{t('properties.villaZone')} {property.villaZone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-[#555555]">
                    <DollarSign className="w-4 h-4 flex-shrink-0" />
                    <span dir="ltr">{property.price.toLocaleString()} {t('properties.egp')}</span>
                  </div>
                </div>

                {property.bedrooms && (
                  <div className="flex items-center gap-4 text-sm text-[#555555] mb-4 pb-4 border-b border-[#E5E5E5]">
                    <span>{property.bedrooms} {t('properties.bed')}</span>
                    <span>{property.bathrooms} {t('properties.bath')}</span>
                    <span dir="ltr">{property.size} {t('properties.sqm')}</span>
                  </div>
                )}
                {property.status === 'available' && (
  <button
    onClick={() => handleSellClick(property._id || property.id, property.unitCode)}
   disabled={sellUnit.isPending}
    className="flex-1 flex items-center justify-center gap-2 mb-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
  >
    <TrendingUp className="w-4 h-4" />
    <span className="text-sm font-bold">{t('properties.sellUnit')}</span>
  </button>
)}

                {!isReadOnly && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditProperty(property)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#F7F7F7] text-[#555555] rounded-lg hover:bg-[#E5E5E5] transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      {t('properties.edit')}
                    </button>
                    <button onClick={() => handleDeleteUnit(property._id || property.id, property.unitCode)} 
  disabled={deleteUnit.isPending} className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Properties Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F7F7F7] border-b border-[#E5E5E5]">
                <tr>
                  <th className={`px-6 py-3 text-sm font-semibold text-[#16100A] ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('properties.unitCode')}
                  </th>
                  <th className={`px-6 py-3 text-sm font-semibold text-[#16100A] ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('properties.type')}
                  </th>
                  <th className={`px-6 py-3 text-sm font-semibold text-[#16100A] ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('properties.purpose')}
                  </th>
                  <th className={`px-6 py-3 text-sm font-semibold text-[#16100A] ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('properties.area')}
                  </th>
                  <th className={`px-6 py-3 text-sm font-semibold text-[#16100A] ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('properties.details')}
                  </th>
                  <th className={`px-6 py-3 text-sm font-semibold text-[#16100A] ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('properties.price')}
                  </th>
                  <th className={`px-6 py-3 text-sm font-semibold text-[#16100A] ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('properties.status')}
                  </th>
                  {!isReadOnly && (
                    <th className={`px-6 py-3 text-sm font-semibold text-[#16100A] ${isRTL ? 'text-left' : 'text-right'}`}>
                      {t('properties.actions')}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {filteredProperties.map((property: any) => (
  <tr key={property._id || property.id} className="hover:bg-[#FAFAFA]">
                    <td className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <span className="font-medium text-[#16100A]">{property.unitCode}</span>
                    </td>
                    <td className={`px-6 py-4 text-sm text-[#555555] ${isRTL ? 'text-right' : 'text-left'}`}>
                      {property.type === 'Apartment' && t('properties.apartment')}
                      {property.type === 'Villa' && t('properties.villa')}
                      {property.type === 'Commercial' && t('properties.commercial')}
                      {property.type === 'Leisure' && t('properties.leisure')}
                    </td>
                    <td className={`px-6 py-4 text-sm text-[#555555] ${isRTL ? 'text-right' : 'text-left'}`}>
                      {property.purpose === 'Sale' && t('properties.sale')}
                      {property.purpose === 'Resale' && t('properties.resale')}
                      {property.purpose === 'Rent' && t('properties.rent')}
                      {property.purpose === 'Commercial' && t('properties.commercial')}
                    </td>
                    <td className={`px-6 py-4 text-sm text-[#555555] ${isRTL ? 'text-right' : 'text-left'}`}>
                      {language === 'ar' ? (
                        property.area === 'Madinaty' ? 'مدينتي' :
                        property.area === 'Rehab' ? 'الرحاب' :
                        property.area === 'Celia' ? 'سيليا' :
                        property.area === 'Thousand' ? 'ألف مسكن' :
                        property.area === 'Sharm Bay' ? 'خليج شرم' : property.area
                      ) : property.area}
                      {property.phase && ` • ${property.phase}`}
                    </td>
                    <td className={`px-6 py-4 text-sm text-[#555555] ${isRTL ? 'text-right' : 'text-left'}`}>
                      {property.floor && property.apartment ? (
                        `${t('properties.floor')} ${property.floor} • ${t('properties.apt')} ${property.apartment}`
                      ) : property.villaZone ? (
                        `${t('properties.villaZone')} ${property.villaZone}`
                      ) : (
                        '-'
                      )}
                      {property.bedrooms && ` • ${property.bedrooms}${t('properties.br')}/${property.bathrooms}${t('properties.ba')}`}
                    </td>
                    <td className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <span className="font-medium text-[#16100A]" dir="ltr">{property.price.toLocaleString()} {t('properties.egp')}</span>
                    </td>
                    <td className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(property.status)}`}>
                        {property.status === 'Available' && t('properties.available')}
                        {property.status === 'Reserved' && t('properties.reserved')}
                        {property.status === 'Sold' && t('properties.sold')}
                      </span>
                    </td>
                    {!isReadOnly && (
                      <td className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'}`}>
                        <div className={`flex items-center gap-2 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                          <button
                            onClick={() => handleEditProperty(property)}
                            className="p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-[#555555]" />
                          </button>
                          <button onClick={() => handleDeleteUnit(property._id || property.id, property.unitCode)} 
  disabled={deleteUnit.isPending} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Property Modal */}
      {modalOpen && (
        <PropertyModal
          property={editingProperty}
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