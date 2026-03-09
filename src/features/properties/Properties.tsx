import React, { useState } from 'react';
import { 
  Plus, LayoutGrid, List, Search, Filter, Edit2, Trash2, 
  Building2, MapPin, TrendingUp
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../store/useConfigStore';
import { useAuthStore } from '../../store/useAuthStore';
import { PropertyModal } from './components/PropertyModal';
import { ImageWithFallback } from './components/ImageWithFallback';
import { useUnits } from './hooks/useUnits';
import z from 'zod';
import { useToastStore } from '../../store/useToastStore';
import { useCreateUnit } from './hooks/useCreateUnit';
import { useDeleteUnit } from './hooks/useDeleteUnit';
import { useSellUnit } from './hooks/useSellUnit';
import { useNavigate } from 'react-router-dom';

interface Property {
  _id: string;
  name?: string;
  project?: {
    _id: string;
    name: string;
  };
  unitCode: string;
  type: string;
  purpose: string;
  status: string;
  price: number;
  size: number;
  area: string;
  bedrooms?: number;
  bathrooms?: number;
  images?: string[];
}

export default function Properties() {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPurpose, setFilterPurpose] = useState<string>('all');
  const [filterArea, setFilterArea] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { t, i18n } = useTranslation('properties');
  const { dir } = useConfigStore();
  const { user } = useAuthStore();
  const { triggerToast } = useToastStore();
  const createUnit = useCreateUnit();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const deleteUnit = useDeleteUnit();
  const sellUnit = useSellUnit();
  const navigate = useNavigate();

  const isRTL = dir === 'rtl';
  const language = i18n.language;
  const isReadOnly = user?.role === 'sales';

  const { data: unitsData, isLoading } = useUnits(currentPage);
  const pagination = unitsData?.pagination;
  const unitList = Array.isArray(unitsData?.data) ? unitsData.data : [];

  const filteredProperties = unitList.filter((property: any) => {
    const searchTermLower = searchTerm.toLowerCase();
    const selectedArea = filterArea.toLowerCase();
    const propertyArea = property.area?.toString().toLowerCase() || '';
    const projectName = property.project?.name?.toLowerCase() || '';

    const matchesSearch =
      property.unitCode?.toString().toLowerCase().includes(searchTermLower) ||
      projectName.includes(searchTermLower) ||
      propertyArea.includes(searchTermLower);

    const matchesArea = filterArea === 'all' || propertyArea === selectedArea;
    const matchesType = filterType === 'all' || property.type?.toLowerCase() === filterType.toLowerCase();
    const matchesStatus = filterStatus === 'all' || property.status?.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesArea && matchesType && matchesStatus;
  });

  const unitSchema = z.object({
    unitNumber: z.string().min(1, "رقم الوحدة مطلوب"),
    type: z.enum(['Apartment', 'Villa', 'Office', 'Studio']),
    price: z.string().min(1, "السعر مطلوب"),
    area: z.string().min(1, "المساحة مطلوبة"),
    project: z.string().nonempty("يجب اختيار مشروع"),
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
    setIsModalOpen(false);
    setSelectedImages([]);
    setFormData({
      unitNumber: '',
      type: 'Apartment',
      price: '',
      area: '',
      project: '',
      status: 'Available'
    });
  };

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
    switch (status?.toLowerCase()) {
      case 'available': return 'bg-green-50 text-green-700 border-emerald-200';
      case 'reserved': return 'bg-orange-50 text-orange-700 border-amber-200';
      case 'sold': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const [deleteConfig, setDeleteConfig] = useState<{ isOpen: boolean; id: string; code: string }>({
    isOpen: false,
    id: '',
    code: ''
  });

  const handleDeleteUnit = (id: string, unitCode: string) => {
    setDeleteConfig({ isOpen: true, id, code: unitCode });
  };

  const confirmDelete = () => {
    deleteUnit.mutate(deleteConfig.id, {
      onSuccess: () => {
        triggerToast("تم حذف الوحدة بنجاح 🗑️", "success");
        setDeleteConfig({ ...deleteConfig, isOpen: false });
      },
      onError: (err: any) => {
        triggerToast(err.response?.data?.message || "فشل حذف الوحدة", "error");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B5752A]"></div>
      </div>
    );
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
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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

      {/* Filter Options */}
      {showFilters && (
        <div className="mb-6 p-4 bg-white border border-[#E5E5E5] rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={`block text-xs font-semibold text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('properties.type')}
              </label>
              <select
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                className={`w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:ring-2 focus:ring-[#B5752A] outline-none ${isRTL ? 'text-right' : 'text-left'}`}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <option value="all">{t('properties.allTypes')}</option>
                <option value="apartment">{t('properties.apartment')}</option>
                <option value="villa">{t('properties.villa')}</option>
                <option value="commercial">{t('properties.commercial')}</option>
                <option value="studio">{t('properties.studio')}</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs font-semibold text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('properties.purpose')}
              </label>
              <select
                value={filterPurpose}
                onChange={(e) => { setFilterPurpose(e.target.value); setCurrentPage(1); }}
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

            <div>
              <label className={`block text-xs font-semibold text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('properties.area')}
              </label>
              <select
                value={filterArea}
                onChange={(e) => { setFilterArea(e.target.value); setCurrentPage(1); }}
                className={`w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm focus:ring-2 focus:ring-[#B5752A] outline-none ${isRTL ? 'text-right' : 'text-left'}`}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <option value="all">{t('properties.allAreas')}</option>
                <option value="Madinaty">{language === 'ar' ? 'مدينتي' : 'Madinaty'}</option>
                <option value="Rehab">{language === 'ar' ? 'الرحاب' : 'Rehab'}</option>
                <option value="Celia">{language === 'ar' ? 'سيليا' : 'Celia'}</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs font-semibold text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('properties.status')}
              </label>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
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

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProperties.map((property: any) => {
            const price = property.price || 0;
            const size = property.size || property.area || 0;

            return (
              <div
                key={property._id || property.id}
                onClick={() => navigate(`/properties/${property._id}`)}
                className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full cursor-pointer"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <div className="h-48 overflow-hidden bg-gray-100 flex-shrink-0">
                  <ImageWithFallback
                    src={property.images?.[0]}
                    alt={property.unitCode}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <div className="min-h-[55px] flex items-start justify-between mb-3">
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <h3 className="font-bold text-[#16100A] text-lg line-clamp-1">
                        {property.unitCode}
                      </h3>
                      <p className="text-xs text-[#555555] font-medium uppercase">
                        {property.type ? t(`properties.${property.type.toLowerCase()}`) : '---'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold border uppercase whitespace-nowrap ${getStatusColor(property.status)}`}>
                      {property.status ? t(`properties.${property.status.toLowerCase()}`) : '---'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4 min-h-[85px]">
                    <div className="flex items-center gap-2 text-sm text-[#555555]">
                      <Building2 className="w-4 h-4 text-[#B5752A] flex-shrink-0" />
                      <span className="line-clamp-1 font-medium">
                        {property.project?.name || t('common:common.none')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#555555]">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="line-clamp-1">
                        {t('properties.size')}: {size} {t('properties.sqm')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-[#16100A]">
                      <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span dir="ltr">{price.toLocaleString()} {t('properties.egp')}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#555555] mb-4 pb-4 border-b border-[#E5E5E5] min-h-[40px]">
                    <div className="flex gap-3">
                      <span className="flex items-center gap-1">
                        <span className="font-bold text-[#16100A]">{property.bedrooms || 0}</span> {t('properties.br')}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-bold text-[#16100A]">{property.bathrooms || 0}</span> {t('properties.ba')}
                      </span>
                    </div>
                    <span className="bg-[#F7F7F7] px-2 py-0.5 rounded text-[10px] font-bold">
                      {property.purpose ? t(`properties.${property.purpose.toLowerCase()}`) : '---'}
                    </span>
                  </div>

                  <div className="mt-auto space-y-2">
                    {property.status?.toLowerCase() === 'available' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSellClick(property._id || property.id, property.unitCode); }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-bold"
                      >
                        <TrendingUp className="w-4 h-4" />
                        {t('properties.sellUnit')}
                      </button>
                    )}

                    {!isReadOnly && (
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditProperty(property); }}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#F7F7F7] text-[#555555] rounded-lg hover:bg-[#E5E5E5] transition-colors text-xs font-medium"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          {t('properties.edit')}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteUnit(property._id || property.id, property.unitCode); }}
                          className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F7F7F7] border-b border-[#E5E5E5]">
                <tr>
                  <th className={`px-6 py-4 text-sm font-bold text-[#16100A] ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('properties.unitCode')}
                  </th>
                  <th className={`px-6 py-4 text-sm font-bold text-[#16100A] ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('properties.type')}
                  </th>
                  <th className={`px-6 py-4 text-sm font-bold text-[#16100A] ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('properties.area')}
                  </th>
                  <th className={`px-6 py-4 text-sm font-bold text-[#16100A] ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('properties.size')}
                  </th>
                  <th className={`px-6 py-4 text-sm font-bold text-[#16100A] ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('properties.details')}
                  </th>
                  <th className={`px-6 py-4 text-sm font-bold text-[#16100A] ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('properties.price')}
                  </th>
                  <th className={`px-6 py-4 text-sm font-bold text-[#16100A] ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('properties.status')}
                  </th>
                  {!isReadOnly && (
                    <th className={`px-6 py-4 text-sm font-bold text-[#16100A] ${isRTL ? 'text-left' : 'text-right'}`}>
                      {t('properties.actions')}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {filteredProperties.map((property: any) => (
                  <tr
                    key={property._id || property.id}
                    onClick={() => navigate(`/properties/${property._id}`)}
                    className="hover:bg-[#FAFAFA] transition-colors cursor-pointer"
                  >
                    <td className={`px-6 py-4 font-medium text-[#B5752A] hover:underline ${isRTL ? 'text-right' : 'text-left'}`}>
                      {property.unitCode}
                    </td>
                    <td className={`px-6 py-4 text-sm text-[#555555] ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t(`properties.${property.type.toLowerCase()}`)}
                    </td>
                    <td className={`px-6 py-4 text-sm text-[#555555] ${isRTL ? 'text-right' : 'text-left'}`}>
                      {language === 'ar' ? (
                        property.area === 'Madinaty' ? 'مدينتي' :
                        property.area === 'Rehab' ? 'الرحاب' :
                        property.area === 'Celia' ? 'سيليا' : property.area
                      ) : property.area}
                      {property.phase && ` • ${property.phase}`}
                    </td>
                    <td className={`px-6 py-4 text-sm text-[#555555] ${isRTL ? 'text-right' : 'text-left'}`} dir="ltr">
                      {property.size} {t('properties.sqm')}
                    </td>
                    <td className={`px-6 py-4 text-sm text-[#555555] ${isRTL ? 'text-right' : 'text-left'}`}>
                      {property.bedrooms
                        ? `${property.bedrooms} ${t('properties.br')} / ${property.bathrooms} ${t('properties.ba')}`
                        : '-'}
                    </td>
                    <td className={`px-6 py-4 font-bold text-[#16100A] ${isRTL ? 'text-right' : 'text-left'}`}>
                      <span dir="ltr">{property.price.toLocaleString()} {t('properties.egp')}</span>
                    </td>
                    <td className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(property.status)}`}>
                        {t(`properties.${property.status.toLowerCase()}`)}
                      </span>
                    </td>
                    {!isReadOnly && (
                      <td className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'}`}>
                        <div className="flex items-center gap-2 justify-end">
                          {property.status?.toLowerCase() === 'available' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleSellClick(property._id || property.id, property.unitCode); }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-xs font-bold"
                            >
                              <TrendingUp className="w-3.5 h-3.5" />
                              {t('properties.sellUnit')}
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEditProperty(property); }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[#F7F7F7] text-[#555555] rounded-lg hover:bg-[#E5E5E5] transition-colors text-xs font-medium"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            {t('properties.edit')}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteUnit(property._id || property.id, property.unitCode); }}
                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-[#FBFBFB] border-t border-[#E5E5E5] flex justify-between items-center">
            <p className="text-sm text-[#555555]">
              {t('properties.totalUnits')}: <span className="font-bold text-[#16100A]">{unitsData?.results}</span>
            </p>
          </div>
        </div>
      )}

      {/* Pagination */}
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

      {/* Delete Confirmation Modal */}
      {deleteConfig.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-[#16100A] mb-2">
                {t('common:common.confirmDelete')}
              </h3>
              <p className="text-[#555555] mb-6">
                {isRTL
                  ? `هل أنت متأكد من حذف الوحدة رقم "${deleteConfig.code}"؟ هذا الإجراء لا يمكن التراجع عنه.`
                  : `Are you sure you want to delete unit "${deleteConfig.code}"? This action cannot be undone.`}
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDeleteConfig({ ...deleteConfig, isOpen: false })}
                  className="flex-1 px-4 py-2 border border-[#E5E5E5] rounded-lg text-[#555555] hover:bg-[#F7F7F7] font-medium transition-colors"
                >
                  {t('properties.cancel')}
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteUnit.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold transition-colors disabled:opacity-50"
                >
                  {deleteUnit.isPending ? "..." : t('properties.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Property Modal */}
      {modalOpen && (
        <PropertyModal
          property={editingProperty as any}
          onClose={() => setModalOpen(false)}
          onSave={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}