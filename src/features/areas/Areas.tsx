import React, { useState, useEffect } from 'react';
import { Plus, Search, MapPin, Building2, Home, Edit2, Trash2, X, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../store/useConfigStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { useAreas } from './hooks/useAreas';
import { useProjects } from '../projects/hooks/useProjects';
import { useCreateArea } from './hooks/useCreateArea';
import { useUpdateArea } from './hooks/useUpdateArea';
import { useDeleteArea } from './hooks/useDeleteArea';

type AreaType = 'villaZone' | 'apartmentZone' | 'commercialZone' | 'RESIDENTIAL';

interface Area {
  _id: string;
  id?: string;
  name: string;
  nameAr?: string;
  location: string;
  cityAr?: string;
  zone?: string;
  group?: string;
  groupAr?: string;
  type: AreaType;
  stats: {
    totalUnits: number;
    availableUnits: number;
    availabilityPercentage: number;
  };
  description?: string;
  descriptionAr?: string;
  project?: string;
}

interface AreaModalProps {
  area: Area | null;
  onClose: () => void;
  onSave: (data: Partial<Area>) => void;
  isPending: boolean;
}

function AreaModal({ area, onClose, onSave, isPending }: AreaModalProps) {
  const { t } = useTranslation(['areas', 'common']);
  const { dir } = useConfigStore();
  const isRTL = dir === 'rtl';

  const { data: projectsData } = useProjects({});
  const projectList = projectsData?.data || projectsData || [];

  const [formData, setFormData] = useState<Partial<Area>>({
    _id:         area?._id         || '',
    project:     area?.project      || '',
    name:        area?.name        || '',
    nameAr:      area?.nameAr      || '',
    location:    area?.location    || '',
    zone:        area?.zone        || '',
    group:       area?.group       || '',
    groupAr:     area?.groupAr     || '',
    type:        area?.type        || 'villaZone',
    stats: {
      totalUnits:             area?.stats?.totalUnits            || 0,
      availableUnits:         area?.stats?.availableUnits        || 0,
      availabilityPercentage: area?.stats?.availabilityPercentage || 0,
    },
    description:   area?.description   || '',
    descriptionAr: area?.descriptionAr || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#16100A]">
            {area ? t('areas.editArea') : t('areas.addArea')}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-[#555555]" />
          </button>
        </div>

        <div className="mx-6 mb-4 px-4 py-3 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-2">
          <span className="text-base">💡</span>
          <p className="text-sm text-blue-700">{t('areas.autoTranslationHint', 'You can write in any language - auto-translation will handle the rest')}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 pb-6 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#16100A]">{t('areas.name', 'Area Name')} *</label>
                <div className="relative">
                  <MapPin className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]`} />
                  <input required value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2.5 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none text-sm`} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#16100A]">{t('areas.city', 'City')} *</label>
                <div className="relative">
                  <Building2 className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]`} />
                  <input required value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className={`w-full ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2.5 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none text-sm`} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#16100A]">{t('areas.zone', 'Zone')}</label>
                <input value={formData.zone} onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  className="w-full px-3 py-2.5 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#16100A]">{t('areas.group', 'Group')}</label>
                <input value={formData.group} onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                  className="w-full px-3 py-2.5 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none text-sm" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('areas.project', 'Project')} *</label>
              <select required value={formData.project} onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                className="w-full px-3 py-2.5 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none text-sm bg-white">
                <option value="">{t('areas.selectProject', 'Select Project')}</option>
                {projectList.map((p: any) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('areas.type', 'Type')} *</label>
              <select required value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as Area['type'] })}
                className="w-full px-3 py-2.5 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none text-sm bg-white">
                <option value="villaZone">{t('areas:villaZone', 'Villa Zone')}</option>
                <option value="apartmentZone">{t('areas:apartmentZone', 'Apartment Zone')}</option>
                <option value="commercialZone">{t('areas:commercialZone', 'Commercial Zone')}</option>
                <option value="RESIDENTIAL">{t('areas:residential', 'Residential')}</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#16100A]">{t('areas.totalUnits', 'Total Units')} *</label>
                <input type="number" min="0" required value={formData.stats?.totalUnits}
                  onChange={(e) => setFormData({ ...formData, stats: { ...formData.stats!, totalUnits: parseInt(e.target.value) || 0, availableUnits: formData.stats?.availableUnits || 0, availabilityPercentage: formData.stats?.availabilityPercentage || 0 } })}
                  className="w-full px-3 py-2.5 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#16100A]">{t('areas.availableUnits', 'Available Units')}</label>
                <input type="number" min="0" value={formData.stats?.availableUnits}
                  onChange={(e) => setFormData({ ...formData, stats: { ...formData.stats!, availableUnits: parseInt(e.target.value) || 0, totalUnits: formData.stats?.totalUnits || 0, availabilityPercentage: formData.stats?.availabilityPercentage || 0 } })}
                  className="w-full px-3 py-2.5 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none text-sm" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('common:common.description', 'Description')}</label>
              <div className="relative">
                <FileText className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 w-4 h-4 text-[#999]`} />
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('areas.descriptionPlaceholder', 'Area description...')}
                  className={`w-full ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2.5 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none text-sm h-24 resize-none`} />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-[#E5E5E5] grid grid-cols-2 gap-3">
            <button type="submit" disabled={isPending}
              className="py-3 gradient-primary text-white rounded-lg font-semibold disabled:opacity-50 text-sm">
              {isPending ? '...' : area ? t('common:common.update', 'Update') : t('common:common.save', 'Save')}
            </button>
            <button type="button" onClick={onClose}
              className="py-3 border border-[#E5E5E5] rounded-lg text-[#555555] hover:bg-gray-50 transition-colors text-sm font-semibold">
              {t('common:common.cancel', 'Cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Areas() {
  const [searchTerm, setSearchTerm]   = useState('');
  const [filterType, setFilterType]   = useState<string>('all');
  const [keyword, setKeyword]         = useState('');
  const [showModal, setShowModal]     = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const LIMIT = 9;

  const { t, i18n } = useTranslation(['areas', 'common', 'properties', 'developers']);
  const { dir }     = useConfigStore();
  const { triggerToast } = useToastStore();

  const isRTL    = dir === 'rtl';
  const language = i18n.language;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setKeyword(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page on filter/search change
  useEffect(() => { setCurrentPage(1); }, [keyword, filterType]);

  const { data: areasData, isLoading } = useAreas({
    page:    currentPage,
    limit:   LIMIT,
    keyword: keyword   || undefined,
    type:    filterType !== 'all' ? filterType : undefined,
  });

  const createArea = useCreateArea();
  const updateArea = useUpdateArea();
  const deleteArea = useDeleteArea();

  const areaList: Area[] = areasData?.data || [];
  const pagination = areasData?.pagination;
  const totalPages = pagination?.numberOfPages ?? 1;

  const handleAddArea  = () => { setSelectedArea(null); setShowModal(true); };
  const handleEditArea = (area: Area) => { setSelectedArea({ ...area }); setShowModal(true); };
  const closeModal     = () => { setShowModal(false); setSelectedArea(null); };

  const handleSaveArea = (data: Partial<Area>) => {
    const formData = new FormData();
    if (data.project)     formData.append('project',     data.project);
    if (data.name)        formData.append('name',        data.name);
    if (data.location)    formData.append('location',    data.location);
    if (data.type)        formData.append('type',        data.type);
    if (data.group)       formData.append('group',       data.group);
    if (data.description) formData.append('description', data.description);

    if (selectedArea) {
      const areaId = selectedArea._id || selectedArea.id || (data as any)._id;
      updateArea.mutate({ id: areaId, data: formData }, {
        onSuccess: () => { triggerToast(language === 'ar' ? 'تم تحديث المنطقة ✅' : 'Area updated ✅', 'success'); closeModal(); },
        onError: (err: any) => { triggerToast(err.response?.data?.message || 'Update failed', 'error'); },
      });
    } else {
      createArea.mutate(formData, {
        onSuccess: () => { triggerToast(language === 'ar' ? 'تمت إضافة المنطقة ✅' : 'Area added ✅', 'success'); closeModal(); },
        onError: (err: any) => { triggerToast(err.response?.data?.message || 'Create failed', 'error'); },
      });
    }
  };

  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    deleteArea.mutate(confirmDeleteId, {
      onSuccess: () => { triggerToast(language === 'ar' ? 'تم حذف المنطقة 🗑️' : 'Area deleted 🗑️', 'success'); setConfirmDeleteId(null); },
      onError: (err: any) => { triggerToast(err.response?.data?.message || 'Delete failed', 'error'); setConfirmDeleteId(null); },
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'villaZone':      return 'bg-[#FEF3E2] text-[#B5752A] border-[#B5752A]';
      case 'apartmentZone':  return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'commercialZone': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'RESIDENTIAL':    return 'bg-green-50 text-green-700 border-green-200';
      default:               return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'villaZone': return <Home className="w-4 h-4" />;
      default:          return <Building2 className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'villaZone':      return t('areas:villaZone');
      case 'apartmentZone':  return t('areas:apartmentZone');
      case 'commercialZone': return t('areas:commercialZone');
      case 'RESIDENTIAL':    return t('areas:residential');
      default:               return type;
    }
  };

  if (isLoading && !areasData) {
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
        <div className="flex items-center justify-between mb-4">
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h1 className="text-2xl font-bold text-[#16100A] mb-2">{t('areas.management')}</h1>
            <p className="text-[#555555]">{t('areas.managementSubtitle')}</p>
          </div>
          <button onClick={handleAddArea}
            className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all">
            <Plus className="w-5 h-5" />
            {t('areas.addArea')}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]`} />
            <input type="text" placeholder={t('areas.searchPlaceholder')} value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`} />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className={`px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] ${isRTL ? 'text-right' : 'text-left'}`}
            dir={isRTL ? 'rtl' : 'ltr'}>
            <option value="all">{t('areas.allTypes')}</option>
            <option value="villaZone">{t('areas.villaZone')}</option>
            <option value="apartmentZone">{t('areas.apartmentZone')}</option>
            <option value="commercialZone">{t('areas.commercialZone')}</option>
            <option value="RESIDENTIAL">{t('areas.residential')}</option>
          </select>
        </div>
      </div>

      {/* Map Section */}
      {areaList.length > 0 && (
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6 mb-6">
          <div className={`mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h2 className="font-bold text-[#16100A] mb-2">{t('areas.madinatyMap')}</h2>
            <p className="text-sm text-[#555555]">{t('areas.madinatyMapSubtitle')}</p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {areaList.map((area) => {
              const availability = area.stats?.availabilityPercentage ?? 0;
              return (
                <div key={area._id} onClick={() => handleEditArea(area)}
                  className="aspect-square gradient-primary rounded-lg p-4 flex flex-col items-center justify-center text-white hover:shadow-lg transition-shadow cursor-pointer relative">
                  <Home className="w-6 h-6 mb-2 opacity-80" />
                  <span className="font-bold text-lg">{area.name}</span>
                  <span className="text-xs mt-1 opacity-90">{area.stats?.totalUnits ?? 0} {t('areas.units')}</span>
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white" style={{ opacity: availability / 100 }} />
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-6 border-t border-[#E5E5E5]">
            <div className={`flex items-center gap-6 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-3 h-3 rounded-full bg-white opacity-100" />
                <span className="text-[#555555]">{t('areas.highAvailability')}</span>
              </div>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-3 h-3 rounded-full bg-white opacity-50" />
                <span className="text-[#555555]">{t('areas.mediumAvailability')}</span>
              </div>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-3 h-3 rounded-full bg-white opacity-20" />
                <span className="text-[#555555]">{t('areas.lowAvailability')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Areas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {areaList.map((area) => (
          <div key={area._id || area.id} className="bg-white rounded-lg border border-[#E5E5E5] p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h3 className="font-bold text-[#16100A] mb-1">{language === 'ar' ? area.nameAr : area.name}</h3>
                <div className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  {area.location}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEditArea(area)} className="p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4 text-[#555555]" />
                </button>
                <button onClick={() => setConfirmDeleteId(area._id || area.id!)} disabled={deleteArea.isPending}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>

            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-medium border mb-4 ${getTypeColor(area.type)}`}>
              {getTypeIcon(area.type)}
              {getTypeLabel(area.type)}
            </span>

            <p className={`text-sm text-[#555555] mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              {language === 'ar' ? area.descriptionAr : area.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-[#E5E5E5]">
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-xs text-[#555555] mb-1">{t('developers:developers.totalUnits')}</p>
                <p className="font-bold text-[#16100A]">{area.stats?.totalUnits ?? 0}</p>
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-xs text-[#555555] mb-1">{t('properties:properties.available')}</p>
                <p className="font-bold text-[#B5752A]">{area.stats?.availableUnits ?? 0}</p>
              </div>
            </div>

            <div>
              <div className={`flex items-center justify-between text-xs text-[#555555] mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>{t('areas.availability')}</span>
                <span>{area.stats?.availabilityPercentage ?? 0}%</span>
              </div>
              <div className="w-full bg-[#F7F7F7] rounded-full h-2">
                <div className="h-2 rounded-full gradient-primary" style={{ width: `${area.stats?.availabilityPercentage ?? 0}%` }} />
              </div>
            </div>

            {area.group && (
              <div className={`mt-4 pt-4 border-t border-[#E5E5E5] ${isRTL ? 'text-right' : 'text-left'}`}>
                <span className="text-xs text-[#555555]">
                  {t('areas.group')}: <span className="font-medium text-[#16100A]">{area.groupAr || area.group}</span>
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={`flex items-center justify-center gap-2 mt-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || isLoading}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E5E5] hover:bg-[#F7F7F7] disabled:opacity-40 transition-colors">
            {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
            const isFirst = page === 1, isLast = page === totalPages, isNear = Math.abs(page - currentPage) <= 1;
            if (!isFirst && !isLast && !isNear) {
              if (page === 2 || page === totalPages - 1) return <span key={page} className="text-[#555555] text-sm px-1">...</span>;
              return null;
            }
            return (
              <button key={page} onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === currentPage ? 'gradient-primary text-white shadow-sm' : 'border border-[#E5E5E5] text-[#555555] hover:bg-[#F7F7F7]'}`}>
                {page}
              </button>
            );
          })}
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || isLoading}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E5E5] hover:bg-[#F7F7F7] disabled:opacity-40 transition-colors">
            {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <span className="text-xs text-[#555555] mx-2">
            {language === 'ar' ? `صفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
          </span>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in duration-300" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-[#16100A] mb-2">{language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}</h3>
              <p className="text-sm text-[#555555] mb-6">
                {language === 'ar' ? 'هل تريد حذف هذه المنطقة؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this area? This action cannot be undone.'}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={confirmDelete} disabled={deleteArea.isPending}
                  className="py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50">
                  {deleteArea.isPending ? '...' : (language === 'ar' ? 'حذف' : 'Delete')}
                </button>
                <button onClick={() => setConfirmDeleteId(null)}
                  className="py-2.5 border border-[#E5E5E5] rounded-lg text-[#555555] hover:bg-gray-50 transition-colors text-sm font-semibold">
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <AreaModal area={selectedArea} onClose={closeModal} onSave={handleSaveArea}
          isPending={createArea.isPending || updateArea.isPending} />
      )}
    </div>
  );
}