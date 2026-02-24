import React, { useState } from 'react';
// شلنا الـ User import القديم
import { 
  Plus, LayoutGrid, List, Search, Filter, Edit2, Trash2, 
  Building2, MapPin, DollarSign, Home 
} from 'lucide-react';
import { useTranslation } from 'react-i18next'; // ✅ البديل الصحيح
import { useConfigStore } from '../../store/useConfigStore'; // ✅ لجلب الاتجاه
import { useAuthStore } from '../../store/useAuthStore'; // ✅ لجلب بيانات المستخدم
import { PropertyModal } from './components/PropertyModal';
import { ImageWithFallback } from './components/ImageWithFallback';

// ... (واجهة Property ومصفوفة mockProperties تبقى كما هي)
interface Property {
  id: string;
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
  image: string;
}
const mockProperties: Property[] = [
  {
    id: '1',
    unitCode: '34',
    floor: 3,
    apartment: 4,
    purpose: 'Sale',
    type: 'Apartment',
    area: 'Madinaty',
    phase: 'B01',
    developer: 'Talaat Moustafa',
    price: 2500000,
    status: 'Available',
    bedrooms: 3,
    bathrooms: 2,
    size: 180,
    image: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBidWlsZGluZ3xlbnwxfHx8fDE3NzA4MDgwMDd8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '2',
    unitCode: 'B1-045',
    purpose: 'Sale',
    type: 'Villa',
    area: 'Madinaty',
    villaZone: 'B1',
    developer: 'Talaat Moustafa',
    price: 8500000,
    status: 'Reserved',
    bedrooms: 5,
    bathrooms: 4,
    size: 450,
    image: 'https://images.unsplash.com/photo-1679364297777-1db77b6199be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB2aWxsYSUyMGV4dGVyaW9yfGVufDF8fHx8MTc3MDg3Njc1MXww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '3',
    unitCode: '78',
    floor: 7,
    apartment: 8,
    purpose: 'Rent',
    type: 'Apartment',
    area: 'Rehab',
    phase: 'B03',
    developer: 'Talaat Moustafa',
    price: 15000,
    status: 'Available',
    bedrooms: 2,
    bathrooms: 2,
    size: 140,
    image: 'https://images.unsplash.com/photo-1617000954880-ab96d29ce722?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcGFydG1lbnQlMjBjb21wbGV4JTIwYnVpbGRpbmd8ZW58MXx8fHwxNzcwODExODA3fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '4',
    unitCode: 'B3-023',
    purpose: 'Sale',
    type: 'Villa',
    area: 'Madinaty',
    villaZone: 'B3',
    developer: 'Talaat Moustafa',
    price: 9200000,
    status: 'Sold',
    bedrooms: 6,
    bathrooms: 5,
    size: 520,
    image: 'https://images.unsplash.com/photo-1622015663381-d2e05ae91b72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB2aWxsYSUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NzA4NDAyNTR8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '5',
    unitCode: '156',
    floor: 15,
    apartment: 6,
    purpose: 'Resale',
    type: 'Apartment',
    area: 'Celia',
    phase: 'V02',
    developer: 'Talaat Moustafa',
    price: 3200000,
    status: 'Available',
    bedrooms: 3,
    bathrooms: 2,
    size: 200,
    image: 'https://images.unsplash.com/photo-1763478959183-136fe6bdcc93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNpZGVudGlhbCUyMHByb3BlcnR5JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzcwNzg4MDY5fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '6',
    unitCode: 'COM-012',
    purpose: 'Commercial',
    constructionStatus: 'Ready',
    type: 'Commercial',
    area: 'Thousand',
    developer: 'Talaat Moustafa',
    price: 5500000,
    status: 'Available',
    size: 280,
    image: 'https://images.unsplash.com/photo-1677324574457-645566fea332?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tZXJjaWFsJTIwYnVpbGRpbmclMjBvZmZpY2V8ZW58MXx8fHwxNzcwODIyMjE1fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '7',
    unitCode: '92',
    floor: 9,
    apartment: 2,
    purpose: 'Sale',
    type: 'Apartment',
    area: 'Sharm Bay',
    phase: 'B07',
    developer: 'Talaat Moustafa',
    price: 1800000,
    status: 'Available',
    bedrooms: 2,
    bathrooms: 1,
    size: 110,
    image: 'https://images.unsplash.com/photo-1627141234469-24711efb373c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWFsJTIwZXN0YXRlJTIwaG91c2UlMjBleHRlcmlvcnxlbnwxfHx8fDE3NzA5MDUyMTF8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '8',
    unitCode: 'B6-078',
    purpose: 'Sale',
    type: 'Villa',
    area: 'Madinaty',
    villaZone: 'B6',
    developer: 'Talaat Moustafa',
    price: 11000000,
    status: 'Available',
    bedrooms: 7,
    bathrooms: 6,
    size: 600,
    image: 'https://images.unsplash.com/photo-1611094016919-36b65678f3d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjByZWFsJTIwZXN0YXRlJTIwcHJvcGVydHl8ZW58MXx8fHwxNzcwODkxMzg5fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
];

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
  
  const isRTL = dir === 'rtl'; // ✅ تعريف المتغير المستخدم في الـ UI
  const language = i18n.language; // ✅ تعريف المتغير المستخدم في الـ UI

  const isReadOnly = user?.role === 'sales'; // ✅ حماية الـ Logic

  // ... (دوال الفلترة و handleAdd/Edit و getStatusColor تبقى كما هي)

  const filteredProperties = mockProperties.filter(property => {
    const matchesSearch = 
      property.unitCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || property.type === filterType;
    const matchesPurpose = filterPurpose === 'all' || property.purpose === filterPurpose;
    const matchesArea = filterArea === 'all' || property.area === filterArea;
    const matchesStatus = filterStatus === 'all' || property.status === filterStatus;

    return matchesSearch && matchesType && matchesPurpose && matchesArea && matchesStatus;
  });

  const handleAddProperty = () => {
    setEditingProperty(null);
    setModalOpen(true);
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-50 text-green-700 border-green-200';
      case 'Reserved': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Sold': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };
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

      {/* Search and Filters */}
      <div className={`flex flex-col sm:flex-row gap-4 mb-6 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
        <div className="flex-1 relative">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555] ${isRTL ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            placeholder={t('properties.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E5E5] rounded-lg hover:bg-[#F7F7F7] transition-colors"
          >
            <Filter className="w-5 h-5 text-[#555555]" />
            {t('properties.filters')}
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

      {/* Filter Options */}
      {showFilters && (
        <div className="mb-6 p-4 bg-white border border-[#E5E5E5] rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('properties.type')}
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <option value="all">{t('properties.allTypes')}</option>
                <option value="Apartment">{t('properties.apartment')}</option>
                <option value="Villa">{t('properties.villa')}</option>
                <option value="Commercial">{t('properties.commercial')}</option>
                <option value="Leisure">{t('properties.leisure')}</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('properties.purpose')}
              </label>
              <select
                value={filterPurpose}
                onChange={(e) => setFilterPurpose(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <option value="all">{t('properties.allPurposes')}</option>
                <option value="Sale">{t('properties.sale')}</option>
                <option value="Resale">{t('properties.resale')}</option>
                <option value="Rent">{t('properties.rent')}</option>
                <option value="Commercial">{t('properties.commercial')}</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('properties.area')}
              </label>
              <select
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <option value="all">{t('properties.allAreas')}</option>
                <option value="Madinaty">{language === 'ar' ? 'مدينتي' : 'Madinaty'}</option>
                <option value="Rehab">{language === 'ar' ? 'الرحاب' : 'Rehab'}</option>
                <option value="Celia">{language === 'ar' ? 'سيليا' : 'Celia'}</option>
                <option value="Thousand">{language === 'ar' ? 'ألف مسكن' : 'Thousand'}</option>
                <option value="Sharm Bay">{language === 'ar' ? 'خليج شرم' : 'Sharm Bay'}</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('properties.status')}
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <option value="all">{t('properties.allStatus')}</option>
                <option value="Available">{t('properties.available')}</option>
                <option value="Reserved">{t('properties.reserved')}</option>
                <option value="Sold">{t('properties.sold')}</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {/* Properties Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden hover:shadow-lg transition-shadow" dir={isRTL ? 'rtl' : 'ltr'}>
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

                {!isReadOnly && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditProperty(property)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#F7F7F7] text-[#555555] rounded-lg hover:bg-[#E5E5E5] transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      {t('properties.edit')}
                    </button>
                    <button className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
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
                {filteredProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-[#FAFAFA]">
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
                          <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
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