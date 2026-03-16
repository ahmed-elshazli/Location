import React, { useState, useRef, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../../store/useConfigStore';
import { useToastStore } from '../../../store/useToastStore';
import { useCreateUnit } from '../hooks/useCreateUnit';
import { useUpdateUnit } from '../hooks/useUpdateUnit';
import { useProjects } from '../../projects/hooks/useProjects';
import { useAreas } from '../../areas/hooks/useAreas';

interface Property {
  _id: string;
  id?: string;
  title?: string;
  name?: string;
  project?: { _id: string; name: string } | string;
  unitCode: string;
  floor?: number;
  apartment?: number;
  purpose: 'Sale' | 'Resale' | 'Rent' | 'Commercial';
  constructionStatus?: 'Ready' | 'Under Construction';
  type: 'Apartment' | 'Villa' | 'Commercial' | 'Leisure';
  area: string;
  phase?: string;
  developer?: string;
  price: number;
  status: 'Available' | 'Reserved' | 'Sold';
  bedrooms?: number;
  bathrooms?: number;
  size: number;
  images?: string[];
}

interface PropertyModalProps {
  property: Property | null;
  onClose: () => void;
  onSave: (property: Partial<Property>) => void;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/webp'];

// ── Searchable Dropdown ────────────────────────────────────────────────────
interface SearchableDropdownProps {
  value: string;
  onChange: (id: string) => void;
  options: { id: string; label: string }[];
  placeholder: string;
  loading?: boolean;
  required?: boolean;
  initialLabel?: string;
}

function SearchableDropdown({ value, onChange, options, placeholder, loading, required, initialLabel }: SearchableDropdownProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find(o => o.id === value)?.label || initialLabel || '';

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

  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const displayValue = open ? search : selectedLabel;

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={displayValue}
        onChange={e => setSearch(e.target.value)}
        onFocus={() => { setOpen(true); setSearch(''); }}
        placeholder={loading ? 'جاري التحميل...' : placeholder}
        disabled={loading}
        className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm bg-white"
      />
      {required && !value && <input type="text" required className="sr-only" />}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#E5E5E5] rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-[#888]">لا توجد نتائج</div>
          ) : (
            filtered.map(opt => (
              <div
                key={opt.id}
                onMouseDown={() => { onChange(opt.id); setSearch(''); setOpen(false); }}
                className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-[#FEF3E2] transition-colors ${opt.id === value ? 'bg-[#FEF3E2] font-medium text-[#B5752A]' : 'text-[#16100A]'}`}
              >
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

export function PropertyModal({ property, onClose, onSave }: PropertyModalProps) {
  const { t, i18n } = useTranslation('properties');
  const { dir } = useConfigStore();
  const isRTL = dir === 'rtl';
  const language = i18n.language;
  const { triggerToast } = useToastStore();

  const getProjectId = (project: any) => {
    if (typeof project === 'object' && project !== null) return project._id || project.id;
    return project;
  };

  const [formData, setFormData] = useState({
    unitCode: property?.unitCode || '',
    floor: property?.floor?.toString() || '',
    apartment: property?.apartment?.toString() || '',
    purpose: property?.purpose || 'Sale',
    constructionStatus: property?.constructionStatus || 'Ready',
    type: (property?.type?.toLowerCase() as any) || 'apartment',
    area: property?.area || '',
    phase: property?.phase || '',
    developer: property?.developer || 'Talaat Moustafa',
    price: property?.price?.toString() || '',
    status: (property?.status?.toLowerCase() as any) || 'available',
    bedrooms: property?.bedrooms?.toString() || '',
    bathrooms: property?.bathrooms?.toString() || '',
    size: property?.size?.toString() || '',
    project: getProjectId(property?.project) || '',
  });

  const [existingImages, setExistingImages] = useState<string[]>(property?.images || []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const createUnit = useCreateUnit();
  const updateUnit = useUpdateUnit();

  const { data: projectsData, isLoading: isProjectsLoading } = useProjects();
  const projectList = Array.isArray(projectsData?.data) ? projectsData.data : (Array.isArray(projectsData) ? projectsData : []);

  const projectOptions = projectList.map((p: any) => ({ id: p._id || p.id, label: p.name }));

  // initial label for edit mode
  const projectInitialLabel = (() => {
    if (!property?.project) return '';
    if (typeof property.project === 'object') return property.project.name || '';
    return projectList.find((p: any) => (p._id || p.id) === property.project)?.name || '';
  })();

  const { data: areasData } = useAreas?.() || { data: null };
  const areaList: { _id: string; name: string; nameAr?: string }[] = areasData?.data || areasData || [
    { _id: 'madinaty', name: 'Madinaty', nameAr: 'مدينتي' },
    { _id: 'rehab', name: 'Rehab', nameAr: 'الرحاب' },
    { _id: 'celia', name: 'Celia', nameAr: 'سيليا' },
    { _id: 'thousand', name: 'Thousand', nameAr: 'ألف مسكن' },
    { _id: 'sharmbay', name: 'Sharm Bay', nameAr: 'خليج شرم' },
  ];

  const phases = ['B01','B02','B03','B04','B05','B06','B07','B08','B09','B010','B011','B012','B013','B014','B015','V02','V03','V04','V05','V06','V07'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    
    // Validate file types - server rejects PNG
    const invalidFiles = filesArray.filter(f => !ALLOWED_TYPES.includes(f.type));
    if (invalidFiles.length > 0) {
      triggerToast('يُسمح فقط بصور JPEG و WebP (لا يُقبل PNG)', 'error');
      e.target.value = '';
      return;
    }

    setNewFiles(prev => [...prev, ...filesArray]);
    const newPreviews = filesArray.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeExistingImage = (url: string) => setExistingImages(prev => prev.filter(img => img !== url));
  const removeNewFile = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submissionData = new FormData();
    submissionData.append('unitCode', formData.unitCode);
    submissionData.append('project', formData.project);
    submissionData.append('type', formData.type.toLowerCase());
    submissionData.append('purpose', formData.purpose.toLowerCase());
    submissionData.append('status', formData.status.toLowerCase());
    submissionData.append('area', formData.area);
    submissionData.append('price', String(formData.price));
    submissionData.append('size', String(formData.size));
    submissionData.append('bedrooms', String(Math.max(0, Number(formData.bedrooms) || 0)));
    submissionData.append('bathrooms', String(Math.max(0, Number(formData.bathrooms) || 0)));

    if (formData.phase)     submissionData.append('phase', formData.phase);
    if (formData.floor)     submissionData.append('floor', formData.floor);
    if (formData.apartment) submissionData.append('apartment', formData.apartment);

    // Only append images on CREATE - server rejects images on PATCH
    if (!property && newFiles.length > 0) {
      newFiles.forEach(file => submissionData.append('images', file));
    }

    if (property) {
      updateUnit.mutate({ id: property._id || property.id!, data: submissionData }, {
        onSuccess: () => { triggerToast('تم التحديث ✅', 'success'); onClose(); },
        onError: (err: any) => triggerToast(err.response?.data?.message || 'فشل التحديث', 'error'),
      });
    } else {
      createUnit.mutate(submissionData, {
        onSuccess: () => { triggerToast('تمت الإضافة ✅', 'success'); onClose(); },
        onError: (err: any) => triggerToast(err.response?.data?.message || 'فشل الإضافة', 'error'),
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between bg-white">
          <h2 className="text-lg font-bold text-[#16100A]">
            {property ? t('properties.editProperty') : t('properties.addProperty')}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-[#555555]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-x-5 gap-y-4">

            {/* Unit Code */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('properties.unitCode')} *</label>
              <input
                type="text"
                value={formData.unitCode}
                onChange={(e) => {
                  const val = e.target.value;
                  let autoData = {};
                  if (formData.type === 'apartment') {
                    if (/^\d{2}$/.test(val)) autoData = { floor: val.charAt(0), apartment: val.charAt(1) };
                    else if (/^\d{3}$/.test(val)) autoData = { floor: val.substring(0, 2), apartment: val.charAt(2) };
                  }
                  setFormData(prev => ({ ...prev, unitCode: val, ...autoData }));
                }}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm"
                placeholder="e.g., 34, B1-045, COM-012"
                required
                dir="ltr"
              />
              <p className="text-xs text-[#AAAAAA]">{t('properties.unitCodeHint')}</p>
            </div>

            {/* Type */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('properties.type')} *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm bg-white"
                required
              >
                <option value="apartment">{t('properties.apartment')}</option>
                <option value="villa">{t('properties.villa')}</option>
                <option value="duplex">{t('properties.duplex')}</option>
                <option value="townhouse">{t('properties.townhouse')}</option>
                <option value="studio">{t('properties.studio')}</option>
                <option value="penthouse">{t('properties.penthouse')}</option>
              </select>
            </div>

            {/* Purpose */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('properties.purpose')} *</label>
              <select
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value as any })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm bg-white"
                required
              >
                <option value="Sale">{t('properties.sale')}</option>
                <option value="Resale">{t('properties.resale')}</option>
                <option value="Rent">{t('properties.rent')}</option>
                <option value="Commercial">{t('properties.commercial')}</option>
              </select>
            </div>

            {/* Project */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('properties.project', 'Project')} *</label>
              <SearchableDropdown
                key={`project-${projectInitialLabel}`}
                value={formData.project}
                onChange={(id) => setFormData({ ...formData, project: id })}
                options={projectOptions}
                placeholder={t('properties.selectProject', 'Select Project')}
                loading={isProjectsLoading}
                required
                initialLabel={projectInitialLabel}
              />
            </div>

            {/* Area */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('properties.area')} *</label>
              <select
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm bg-white"
                required
              >
                <option value="">{t('properties.selectArea') || 'Select Area'}</option>
                {areaList.map((area) => (
                  <option key={area._id} value={area._id}>
                    {language === 'ar' ? (area.nameAr || area.name) : area.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Phase */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('properties.phase')}</label>
              <select
                value={formData.phase}
                onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm bg-white"
              >
                <option value="">{t('properties.selectPhase')}</option>
                {phases.map(phase => (
                  <option key={phase} value={phase}>{phase}</option>
                ))}
              </select>
            </div>

            {/* Floor */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('properties.floor')}</label>
              <input
                type="text"
                value={formData.floor}
                readOnly
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg bg-[#F7F7F7] text-sm text-[#AAAAAA]"
                placeholder={t('properties.autoExtracted')}
                dir="ltr"
              />
            </div>

            {/* Apartment Number */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('properties.apartmentNumber')}</label>
              <input
                type="text"
                value={formData.apartment}
                readOnly
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg bg-[#F7F7F7] text-sm text-[#AAAAAA]"
                placeholder={t('properties.autoExtracted')}
                dir="ltr"
              />
            </div>

            {/* Developer */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('properties.developer')} *</label>
              <input
                type="text"
                value={formData.developer}
                onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm"
                required
              />
            </div>

            {/* Price */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('properties.price')} ({t('properties.egp')}) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm"
                placeholder="e.g., 2500000"
                required
                dir="ltr"
              />
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('properties.status')} *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm bg-white"
                required
              >
                <option value="available">{t('properties.available')}</option>
                <option value="reserved">{t('properties.reserved')}</option>
                <option value="sold">{t('properties.sold')}</option>
              </select>
            </div>

            {/* Size */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('properties.size')} ({t('properties.sqm')}) *</label>
              <input
                type="number"
                min="0"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm"
                placeholder="e.g., 180"
                required
                dir="ltr"
              />
            </div>

            {/* Bedrooms */}
            {formData.type !== 'commercial' && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#16100A]">{t('properties.bedrooms')}</label>
                <input
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm"
                  placeholder="e.g., 3"
                  dir="ltr"
                />
              </div>
            )}

            {/* Bathrooms */}
            {formData.type !== 'commercial' && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#16100A]">{t('properties.bathrooms')}</label>
                <input
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm"
                  placeholder="e.g., 2"
                  dir="ltr"
                />
              </div>
            )}

            {/* Images */}
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium text-[#16100A]">{t('properties.images')}</label>
              {property ? (
                <p className="text-xs text-orange-500">⚠️ {language === 'ar' ? 'تعديل الصور غير مدعوم من السيرفر حالياً' : 'Image editing is not supported by the server'}</p>
              ) : (
                <p className="text-xs text-orange-500">⚠️ {language === 'ar' ? 'يُسمح فقط بـ JPEG و WebP (لا يُقبل PNG)' : 'Only JPEG & WebP allowed (PNG not supported)'}</p>
              )}

              {(existingImages.length > 0 || previews.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {existingImages.map((url, idx) => (
                    <div key={idx} className="relative group h-16 w-16 rounded-lg overflow-hidden border">
                      <img src={url} alt="property" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeExistingImage(url)}
                        className="absolute top-0.5 right-0.5 p-0.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                  {previews.map((url, idx) => (
                    <div key={idx} className="relative group h-16 w-16 rounded-lg overflow-hidden border border-blue-200">
                      <img src={url} alt="new" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeNewFile(idx)}
                        className="absolute top-0.5 right-0.5 p-0.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {!property && (
                <label className="inline-flex flex-col items-center justify-center gap-1 px-5 py-3 border border-[#E5E5E5] rounded-lg cursor-pointer hover:bg-[#F7F7F7] transition-colors w-fit">
                  <Upload className="w-5 h-5 text-[#555555]" />
                  <span className="text-sm text-[#555555]">{t('properties.uploadImages') || 'Upload Images'}</span>
                  <input type="file" multiple onChange={handleFileChange} className="hidden" accept="image/jpeg,image/jpg,image/webp" />
                </label>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-[#E5E5E5]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-[#E5E5E5] rounded-lg text-sm text-[#555555] hover:bg-gray-50 transition-colors"
            >
              {t('properties.cancel')}
            </button>
            <button
              type="submit"
              disabled={createUnit.isPending || updateUnit.isPending}
              className="px-6 py-2 gradient-primary text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {createUnit.isPending || updateUnit.isPending
                ? '...'
                : property ? t('properties.saveChanges') : t('properties.addProperty')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}