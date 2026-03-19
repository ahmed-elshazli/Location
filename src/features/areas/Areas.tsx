import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, MapPin, Building2, Home, Edit2, Trash2, X, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../store/useConfigStore';
import { useToastStore } from '../../store/useToastStore';
import { useAreas } from './hooks/useAreas';
import { useProjects } from '../projects/hooks/useProjects';
import { useCreateArea } from './hooks/useCreateArea';
import { useUpdateArea } from './hooks/useUpdateArea';
import { useDeleteArea } from './hooks/useDeleteArea';

// ── SearchableDropdown (نفس الـ DealModal) ────────────────────────────────
interface SearchableDropdownProps {
  value: string;
  onChange: (id: string, label: string) => void;
  options: { id: string; label: string }[];
  placeholder: string;
  loading?: boolean;
  disabled?: boolean;
  required?: boolean;
  initialLabel?: string;
}

function SearchableDropdown({ value, onChange, options, placeholder, loading, disabled, initialLabel }: SearchableDropdownProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen]     = useState(false);
  const ref                 = useRef<HTMLDivElement>(null);

  // الـ label المختار — من الـ options لو موجود، وإلا الـ initialLabel
  const selectedLabel = options.find(o => o.id === value)?.label || initialLabel || '';

  // لما الـ options تتحمل وفيه value محدد، نتأكد إن الـ display صح
  const [resolvedLabel, setResolvedLabel] = useState(initialLabel || '');
  useEffect(() => {
    const found = options.find(o => o.id === value);
    if (found) setResolvedLabel(found.label);
  }, [options.length, value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (opt: { id: string; label: string }) => {
    onChange(opt.id, opt.label);
    setResolvedLabel(opt.label);
    setSearch('');
    setOpen(false);
  };

  const displayValue = open ? search : resolvedLabel;

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={displayValue}
        onChange={e => setSearch(e.target.value)}
        onFocus={() => { setOpen(true); setSearch(''); }}
        placeholder={loading ? 'جاري التحميل...' : placeholder}
        disabled={disabled || loading}
        className={`w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm ${disabled ? 'bg-[#F7F7F7] cursor-not-allowed text-[#555]' : 'bg-white'}`}
      />
      {open && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#E5E5E5] rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-[#888]">لا توجد نتائج</div>
          ) : (
            filtered.map(opt => (
              <div key={opt.id} onMouseDown={() => handleSelect(opt)}
                className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-[#FEF3E2] transition-colors ${opt.id === value ? 'bg-[#FEF3E2] font-medium text-[#B5752A]' : 'text-[#16100A]'}`}>
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
// ──────────────────────────────────────────────────────────────────────────

interface Area {
  _id: string;
  id?: string;
  name: string;
  nameAr?: string;
  location: string;
  zone?: string;
  group?: string;
  groupAr?: string;
  type?: string;
  project?: string;
  // nested stats (القديم)
  stats?: { totalUnits: number; availableUnits: number; availabilityPercentage: number };
  // flat stats (الجديد)
  totalUnits?: number;
  availableUnits?: number;
  availabilityPercentage?: number;
  description?: string;
  descriptionAr?: string;
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

  const { data: projectsData, isLoading: isProjectsLoading } = useProjects({});
  const projectList: { _id: string; name: string }[] = projectsData?.data || projectsData || [];

  const areaProjectId = area?.project || '';
  const projectInList = projectList.some(p => p._id === areaProjectId);
  const allProjects   = [
    ...(areaProjectId && !projectInList ? [{ _id: areaProjectId, name: areaProjectId }] : []),
    ...projectList,
  ];

  const projectFromList     = projectList.find(p => p._id === areaProjectId);
  const projectInitialLabel = projectFromList?.name || '';
  const projectOptions      = allProjects.map(p => ({ id: p._id, label: p.name }));

  const [formData, setFormData] = useState<Partial<Area>>({
    _id:           area?._id           || '',
    project:       areaProjectId,
    name:          area?.name          || '',
    nameAr:        area?.nameAr        || '',
    location:      area?.location      || '',
    zone:          area?.zone          || '',
    group:         area?.group         || '',
    groupAr:       area?.groupAr       || '',
    type:          area?.type          || 'villa Zone',
    description:   area?.description   || '',
    descriptionAr: area?.descriptionAr || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#16100A]">
            {area ? t('areas.editArea') : t('areas.addArea')}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-[#555555]" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 pb-6 flex flex-col gap-4 max-h-[65vh] overflow-y-auto">

            {/* Name + City */}
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

            {/* Project — SearchableDropdown (نفس الـ DealModal unit) */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('areas.project', 'Project')} *</label>
              <SearchableDropdown
                key={`project-${projectList.length}-${areaProjectId}`}
                value={formData.project as string}
                onChange={(id) => setFormData({ ...formData, project: id })}
                options={projectOptions}
                placeholder={isRTL ? 'ابحث عن مشروع...' : 'Search project...'}
                loading={isProjectsLoading}
                initialLabel={projectInitialLabel}
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('common:common.description', 'Description')}</label>
              <div className="relative">
                <FileText className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 w-4 h-4 text-[#999]`} />
                <textarea value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
  const [searchTerm, setSearchTerm]         = useState('');
  const [filterType, setFilterType]         = useState<string>('all');
  const [keyword, setKeyword]               = useState('');
  const [showModal, setShowModal]           = useState(false);
  const [selectedArea, setSelectedArea]     = useState<Area | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage]       = useState(1);
  const LIMIT = 9;

  const { t, i18n }      = useTranslation(['areas', 'common', 'properties']);
  const { dir }          = useConfigStore();
  const { triggerToast } = useToastStore();
  const isRTL            = dir === 'rtl';
  const language         = i18n.language;

  useEffect(() => {
    const timer = setTimeout(() => setKeyword(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => { setCurrentPage(1); }, [keyword, filterType]);

  const { data: areasData, isLoading } = useAreas({ page: currentPage, limit: LIMIT, keyword: keyword || undefined });

  // جلب المشاريع عشان نعرض الاسم في الكارد
  const { data: projectsData } = useProjects({});
  const projectList: { _id: string; name: string }[] = projectsData?.data || projectsData || [];

  const getProjectName = (project: any): string => {
    if (!project) return '';
    if (typeof project === 'object' && project.name) return project.name;
    const id = typeof project === 'object' ? (project._id || project.id) : project;
    return projectList.find(p => p._id === id)?.name || '';
  };

  const createArea = useCreateArea();
  const updateArea = useUpdateArea();
  const deleteArea = useDeleteArea();

  const areaList: Area[]  = areasData?.data || [];
  const totalPages        = areasData?.pagination?.numberOfPages ?? 1;

  const handleAddArea  = () => { setSelectedArea(null); setShowModal(true); };
  const handleEditArea = (area: Area) => { setSelectedArea({ ...area }); setShowModal(true); };
  const closeModal     = () => { setShowModal(false); setSelectedArea(null); };

  const handleSaveArea = (data: Partial<Area>) => {
    const fd = new FormData();
    if (data.project)     fd.append('project',     data.project);
    if (data.name)        fd.append('name',        data.name);
    if (data.location)    fd.append('location',    data.location);
    if (data.group)       fd.append('group',       data.group);
    if (data.description) fd.append('description', data.description);

    if (selectedArea) {
      const areaId = selectedArea._id || selectedArea.id || (data as any)._id;
      updateArea.mutate({ id: areaId, data: fd }, {
        onSuccess: () => { triggerToast(language === 'ar' ? 'تم تحديث المنطقة ✅' : 'Area updated ✅', 'success'); closeModal(); },
        onError:   (err: any) => { triggerToast(err.response?.data?.message || 'Update failed', 'error'); },
      });
    } else {
      createArea.mutate(fd, {
        onSuccess: () => { triggerToast(language === 'ar' ? 'تمت إضافة المنطقة ✅' : 'Area added ✅', 'success'); closeModal(); },
        onError:   (err: any) => { triggerToast(err.response?.data?.message || 'Create failed', 'error'); },
      });
    }
  };

  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    deleteArea.mutate(confirmDeleteId, {
      onSuccess: () => { triggerToast(language === 'ar' ? 'تم حذف المنطقة 🗑️' : 'Area deleted 🗑️', 'success'); setConfirmDeleteId(null); },
      onError:   (err: any) => { triggerToast(err.response?.data?.message || 'Delete failed', 'error'); setConfirmDeleteId(null); },
    });
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
            <option value="villa Zone">{t('areas.villaZone')}</option>
            <option value="apartment Zone">{t('areas.apartmentZone')}</option>
            <option value="commercial Zone">{t('areas.commercialZone')}</option>
            <option value="mixed">{t('areas:mixed', 'Mixed')}</option>
            <option value="service Area">{t('areas:serviceArea', 'Service Area')}</option>
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
            {areaList.map((area) => (
              <div key={area._id} onClick={() => handleEditArea(area)}
                className="aspect-square gradient-primary rounded-lg p-4 flex flex-col items-center justify-center text-white hover:shadow-lg transition-shadow cursor-pointer">
                <Home className="w-6 h-6 mb-2 opacity-80" />
                <span className="font-bold text-lg">{area.name}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-[#E5E5E5]">
            <div className={`flex items-center gap-6 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-3 h-3 rounded-full bg-white opacity-100" /><span className="text-[#555555]">{t('areas.highAvailability')}</span>
              </div>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-3 h-3 rounded-full bg-white opacity-50" /><span className="text-[#555555]">{t('areas.mediumAvailability')}</span>
              </div>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-3 h-3 rounded-full bg-white opacity-20" /><span className="text-[#555555]">{t('areas.lowAvailability')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty */}
      {areaList.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-16 text-center text-[#AAAAAA]">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">{language === 'ar' ? 'لا توجد مناطق' : 'No areas found'}</p>
        </div>
      )}

      {/* Areas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {areaList.map((area) => {
          const projectName = getProjectName(area.project);
          const total       = area.totalUnits             ?? area.stats?.totalUnits             ?? 0;
          const available   = area.availableUnits         ?? area.stats?.availableUnits         ?? 0;
          const percentage  = area.availabilityPercentage ?? area.stats?.availabilityPercentage ?? 0;
          const sold        = total - available;

          const barColor = 'bg-[#B5752A]';
          const pctColor = 'text-[#B5752A]';

          return (
            <div key={area._id || area.id} className="bg-white rounded-xl border border-[#E5E5E5] p-5 hover:shadow-md transition-shadow flex flex-col gap-4">

              {/* Row 1: Name + actions */}
              <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex flex-col gap-1 ${isRTL ? 'items-end' : ''}`}>
                  <h3 className="font-bold text-[#16100A] text-base leading-tight">
                    {language === 'ar' ? (area.nameAr || area.name) : area.name}
                  </h3>
                  {area.location && (
                    <div className={`flex items-center gap-1 text-sm text-[#777] ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <MapPin className="w-3.5 h-3.5 text-[#777]" />
                      <span>{area.location}</span>
                    </div>
                  )}
                </div>
                <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <button onClick={() => handleEditArea(area)} className="p-1.5 hover:bg-[#F7F7F7] rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4 text-[#888]" />
                  </button>
                  <button onClick={() => setConfirmDeleteId(area._id || area.id!)} disabled={deleteArea.isPending}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              {/* Row 2: Type badge + project */}
              <div className={`flex items-center gap-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                {area.type && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium
                    ${area.type === 'villa Zone'      ? 'bg-[#FEF3E2] text-[#B5752A] border-[#B5752A]/30' :
                      area.type === 'apartment Zone'  ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      area.type === 'commercial Zone' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      'bg-gray-50 text-gray-600 border-gray-200'}`}>
                    <Home className="w-3 h-3" />
                    {area.type === 'villa Zone'      ? (language === 'ar' ? 'منطقة فيلات' : 'Villa Zone') :
                     area.type === 'apartment Zone'  ? (language === 'ar' ? 'منطقة شقق'  : 'Apartment Zone') :
                     area.type === 'commercial Zone' ? (language === 'ar' ? 'منطقة تجارية' : 'Commercial Zone') :
                     area.type}
                  </span>
                )}
                {projectName && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#E5E5E5] text-xs text-[#555] bg-[#F7F7F7]">
                    <Building2 className="w-3 h-3 text-[#B5752A]" />
                    {projectName}
                  </span>
                )}
              </div>

              {/* Row 3: Description */}
              {(area.description || area.descriptionAr) && (
                <p className={`text-sm text-[#777] leading-relaxed line-clamp-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? (area.descriptionAr || area.description) : area.description}
                </p>
              )}

              {/* Row 4: Stats — Total + Available */}
              <div className={`flex items-end gap-10 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <p className="text-xs text-[#888] mb-0.5">{language === 'ar' ? 'إجمالي الوحدات' : 'Total Units'}</p>
                  <p className="text-xl font-bold text-[#16100A]">{total}</p>
                </div>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <p className="text-xs text-[#888] mb-0.5">{language === 'ar' ? 'المتاحة' : 'Available'}</p>
                  <p className="text-xl font-bold text-[#B5752A]">{available}</p>
                </div>
              </div>

              {/* Row 5: Progress bar + % */}
              <div className="space-y-1.5">
                <div className={`flex items-center justify-between text-xs text-[#888] ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>{language === 'ar' ? 'التوافر' : 'Availability'}</span>
                  <span className={`font-semibold ${pctColor}`}>{percentage}%</span>
                </div>
                <div className="w-full h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
                </div>
              </div>

              {/* Row 6: Group */}
              {area.group && (
                <p className={`text-xs text-[#555] ${isRTL ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'المجموعة' : 'Group'}:{' '}
                  <span className="font-semibold text-[#16100A]">{language === 'ar' ? (area.groupAr || area.group) : area.group}</span>
                </p>
              )}

            </div>
          );
        })}
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
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
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