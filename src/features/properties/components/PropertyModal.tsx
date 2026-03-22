import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../../store/useConfigStore';
import { useToastStore } from '../../../store/useToastStore';
import { useCreateUnit } from '../hooks/useCreateUnit';
import { useUpdateUnit } from '../hooks/useUpdateUnit';
import { useProjects } from '../../projects/hooks/useProjects';
import { useAreas } from '../../areas/hooks/useAreas';
import { createUnitApi, deleteUnitApi } from '../api/unitsApi';

interface Property {
  _id: string;
  id?: string;
  project?: { _id: string; name: string } | string;
  unitCode: string;
  floor?: number;
  apartmentNumber?: number;
  villaNumber?: number;
  purpose: string;
  type: string;
  area: string;
  phase?: string;
  group?: string;
  building?: number;
  block?: string;
  developer?: string;
  price: number;
  status: string;
  bedrooms?: number;
  bathrooms?: number;
  size: number;
  images?: string[];
  notes?: string;
  city?: string;
}

interface PropertyModalProps {
  property: Property | null;
  onClose: () => void;
  onSave: (property: Partial<Property>) => void;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/webp'];

// ── Villa group logic ──────────────────────────────────────────────────────
function getVillaGroup(villaNum: number): number {
  if (villaNum >= 1  && villaNum <= 9)  return 1;
  if (villaNum >= 10 && villaNum <= 13) return 2;
  if (villaNum >= 14 && villaNum <= 17) return 4;
  if (villaNum >= 18 && villaNum <= 22) return 5;
  if (villaNum >= 23 && villaNum <= 26) return 3;
  return 0;
}

// ── Parse apartment code: xxx/xxx/xx or xx/xxx/xx ─────────────────────────
function parseApartmentCode(code: string) {
  const parts = code.split('/');
  if (parts.length !== 3) return null;
  const [p1, p2, p3] = parts.map(p => p.trim());
  if (!p1 || !p2 || !p3) return null;

  const areaNum   = p1.length === 3 ? p1.substring(0, 2) : p1; // first 2 digits if 3-digit
  const area      = `B${areaNum}`;
  const group     = p1;
  const building  = p2;
  // p3: last digit = floor, preceding = unit
  const floor     = p3.slice(-1);
  const unit      = p3.slice(0, -1) || p3;

  return { area, group, building, unit, floor };
}

// ── Parse villa code: xx/xxx/x or x/xxx/x ────────────────────────────────
function parseVillaCode(code: string) {
  const parts = code.split('/');
  if (parts.length !== 3) return null;
  const [p1, p2, p3] = parts.map(p => p.trim());
  if (!p1 || !p2 || !p3) return null;

  const area        = `V${p1}`;
  const villaNum    = parseInt(p3, 10);
  const group       = isNaN(villaNum) ? 0 : getVillaGroup(villaNum);
  const block       = p2;
  const villaNumber = p3;

  return { area, group: group.toString(), block, villaNumber };
}

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
  const [search, setSearch]   = useState('');
  const [open, setOpen]       = useState(false);
  const [resolved, setResolved] = useState(initialLabel || '');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const found = options.find(o => o.id === value);
    if (found) setResolved(found.label);
  }, [options.length, value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setSearch(''); }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered     = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const displayValue = open ? search : resolved;

  return (
    <div ref={ref} className="relative">
      <input type="text" value={displayValue}
        onChange={e => setSearch(e.target.value)}
        onFocus={() => { setOpen(true); setSearch(''); }}
        placeholder={loading ? 'جاري التحميل...' : placeholder}
        disabled={loading}
        className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm bg-white"
      />
      {required && !value && <input type="text" required className="sr-only" />}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#E5E5E5] rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.length === 0
            ? <div className="px-4 py-3 text-sm text-[#888]">لا توجد نتائج</div>
            : filtered.map(opt => (
                <div key={opt.id} onMouseDown={() => { onChange(opt.id); setResolved(opt.label); setSearch(''); setOpen(false); }}
                  className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-[#FEF3E2] transition-colors ${opt.id === value ? 'bg-[#FEF3E2] font-medium text-[#B5752A]' : 'text-[#16100A]'}`}>
                  {opt.label}
                </div>
              ))
          }
        </div>
      )}
    </div>
  );
}
// ──────────────────────────────────────────────────────────────────────────

// ── Read-only auto-filled field ───────────────────────────────────────────
function AutoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-[#16100A]">{label}</label>
      <input type="text" value={value} readOnly dir="ltr"
        className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg bg-[#F0FDF4] text-sm text-[#16a34a] font-medium" />
    </div>
  );
}
// ──────────────────────────────────────────────────────────────────────────

export function PropertyModal({ property, onClose, onSave }: PropertyModalProps) {
  const { t, i18n }      = useTranslation('properties');
  const { dir }          = useConfigStore();
  const isRTL            = dir === 'rtl';
  const language         = i18n.language;
  const { triggerToast } = useToastStore();

  const getProjectId = (project: any) => {
    if (typeof project === 'object' && project !== null) return project._id || project.id;
    return project || '';
  };

  // ── Unit Category ─────────────────────────────────────────────────────────
  const [unitCategory, setUnitCategory] = useState<'apartment' | 'villa'>(
    property ? (property.type?.toLowerCase().includes('villa') ? 'villa' : 'apartment') : 'apartment'
  );

  // ── Raw code input ────────────────────────────────────────────────────────
  const [rawCode, setRawCode] = useState(property?.unitCode || '');

  // ── Auto-parsed fields ────────────────────────────────────────────────────
  const [parsed, setParsed] = useState({
    area:        property?.area        || '',
    group:       property?.group       || '',
    building:    property?.building?.toString() || '',
    block:       property?.block       || '',
    unit:        property?.apartmentNumber?.toString() || '',
    floor:       property?.floor?.toString()           || '',
    villaNumber: property?.villaNumber?.toString()     || '',
  });

  // ── Other form fields ─────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    city:        property?.city        || '',
    project:     getProjectId(property?.project),
    type:        property?.type?.toLowerCase() || 'apartment',
    purpose:     property?.purpose?.toLowerCase() || 'sale',
    status:      property?.status?.toLowerCase()  || 'available',
    price:       property?.price?.toString()  || '',
    size:        property?.size?.toString()   || '',
    bedrooms:    property?.bedrooms?.toString()  || '',
    bathrooms:   property?.bathrooms?.toString() || '',
    notes:       property?.notes || '',
    developer:   property?.developer || 'Talaat Moustafa',
    phase:       property?.phase || '',
  });

  const [existingImages, setExistingImages] = useState<string[]>(property?.images || []);
  const [newFiles, setNewFiles]             = useState<File[]>([]);
  const [previews, setPreviews]             = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // ── Auto-parse code on change ─────────────────────────────────────────────
  useEffect(() => {
    if (!rawCode.includes('/')) return;
    if (unitCategory === 'apartment') {
      const result = parseApartmentCode(rawCode);
      if (result) setParsed(prev => ({ ...prev, area: result.area, group: result.group, building: result.building, unit: result.unit, floor: result.floor }));
    } else {
      const result = parseVillaCode(rawCode);
      if (result) setParsed(prev => ({ ...prev, area: result.area, group: result.group, block: result.block, villaNumber: result.villaNumber }));
    }
  }, [rawCode, unitCategory]);

  // ── Projects ───────────────────────────────────────────────────────────────
  const { data: projectsData, isLoading: isProjectsLoading } = useProjects();
  const projectList    = Array.isArray(projectsData?.data) ? projectsData.data : (Array.isArray(projectsData) ? projectsData : []);
  const projectOptions = projectList.map((p: any) => ({ id: p._id || p.id, label: p.name }));
  const projectInitialLabel = (() => {
    if (!property?.project) return '';
    if (typeof property.project === 'object') return (property.project as any).name || '';
    return projectList.find((p: any) => (p._id || p.id) === property.project)?.name || '';
  })();

  // ── Areas ──────────────────────────────────────────────────────────────────
  const { data: areasData } = useAreas?.() || { data: null };
  const areaList: { _id: string; name: string; nameAr?: string }[] = areasData?.data || areasData || [];

  const createUnit = useCreateUnit();
  const updateUnit = useUpdateUnit();

  // ── Upload images via backend (POST temp unit) ────────────────────────────
  const uploadImagesViaBackend = async (files: File[]): Promise<string[]> => {
    const fd = new FormData();
    fd.append('unitCode',  `__temp_${Date.now()}`);
    fd.append('project',   formData.project);
    fd.append('type',      unitCategory === 'villa' ? 'villa' : formData.type);
    fd.append('purpose',   formData.purpose);
    fd.append('status',    'available');
    fd.append('area',      parsed.area || 'temp');
    fd.append('price',     String(formData.price || 1));
    fd.append('size',      String(formData.size  || 1));
    fd.append('bedrooms',  '0');
    fd.append('bathrooms', '0');
    files.forEach(file => fd.append('images', file));
    const res  = await createUnitApi(fd);
    const urls: string[] = res?.images || res?.data?.images || [];
    const tempId = res?._id || res?.data?._id;
    if (tempId) deleteUnitApi(tempId).catch(() => {});
    return urls;
  };

  const imagesChanged = newFiles.length > 0 || existingImages.length !== (property?.images?.length || 0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    const invalid = filesArray.filter(f => !ALLOWED_TYPES.includes(f.type));
    if (invalid.length > 0) { triggerToast('يُسمح فقط بصور JPEG و WebP', 'error'); e.target.value = ''; return; }
    setNewFiles(prev => [...prev, ...filesArray]);
    setPreviews(prev => [...prev, ...filesArray.map(f => URL.createObjectURL(f))]);
  };

  const removeExistingImage = (url: string) => setExistingImages(prev => prev.filter(img => img !== url));
  const removeNewFile = (i: number) => {
    setNewFiles(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const mutateOptions = {
      onSuccess: () => { triggerToast(property ? 'تم التحديث ✅' : 'تمت الإضافة ✅', 'success'); onClose(); },
      onError: (err: any) => {
        const msg = err.response?.data?.message;
        triggerToast(Array.isArray(msg) ? msg[0] : msg || (property ? 'فشل التحديث' : 'فشل الإضافة'), 'error');
      },
    };

    // build unitCode from parsed
    const finalUnitCode = rawCode;
    // build area ID — try to match from areaList by name, fallback to parsed.area string
    const areaId = areaList.find(a => a.name === parsed.area || a._id === parsed.area)?._id || parsed.area;

    if (property) {
      // UPDATE
      let uploadedUrls: string[] = [];
      if (imagesChanged && newFiles.length > 0) {
        setIsUploadingImages(true);
        try { uploadedUrls = await uploadImagesViaBackend(newFiles); }
        catch { triggerToast('فشل رفع الصور', 'error'); setIsUploadingImages(false); return; }
        setIsUploadingImages(false);
      }
      const allImages = [...existingImages, ...uploadedUrls];
      const jsonData: Record<string, any> = {
        unitCode:  finalUnitCode,
        project:   formData.project,
        type:      unitCategory === 'villa' ? 'villa' : formData.type,
        purpose:   formData.purpose,
        status:    formData.status,
        area:      areaId,
        price:     Number(formData.price),
        size:      Number(formData.size),
        bedrooms:  Math.max(0, Number(formData.bedrooms)  || 0),
        bathrooms: Math.max(0, Number(formData.bathrooms) || 0),
        images:    allImages,
        ...(formData.notes    && { notes:    formData.notes }),
        ...(formData.phase    && { phase:    formData.phase }),
        ...(parsed.group      && { group:    parsed.group }),
        ...(parsed.floor      && { floor:    Number(parsed.floor) }),
        ...(parsed.building   && { building: Number(parsed.building) }),
        ...(parsed.block      && { block:    parsed.block }),
        ...(parsed.unit       && { apartmentNumber: Number(parsed.unit) }),
        ...(parsed.villaNumber && { villaNumber: Number(parsed.villaNumber) }),
      };
      updateUnit.mutate({ id: property._id || property.id!, data: jsonData }, mutateOptions);

    } else {
      // CREATE
      const fd = new FormData();
      fd.append('unitCode',  finalUnitCode);
      fd.append('project',   formData.project);
      fd.append('type',      unitCategory === 'villa' ? 'villa' : formData.type);
      fd.append('purpose',   formData.purpose);
      fd.append('status',    formData.status);
      fd.append('area',      areaId);
      fd.append('price',     String(formData.price));
      fd.append('size',      String(formData.size));
      fd.append('bedrooms',  String(Math.max(0, Number(formData.bedrooms)  || 0)));
      fd.append('bathrooms', String(Math.max(0, Number(formData.bathrooms) || 0)));
      if (formData.notes)    fd.append('notes',    formData.notes);
      if (formData.phase)    fd.append('phase',    formData.phase);
      if (parsed.group)      fd.append('group',    parsed.group);
      if (parsed.floor)      fd.append('floor',    parsed.floor);
      if (parsed.building)   fd.append('building', parsed.building);
      if (parsed.block)      fd.append('block',    parsed.block);
      if (parsed.unit)       fd.append('apartmentNumber', parsed.unit);
      if (parsed.villaNumber) fd.append('villaNumber', parsed.villaNumber);
      newFiles.forEach(file => fd.append('images', file));
      createUnit.mutate(fd, mutateOptions);
    }
  };

  const isPending = createUnit.isPending || updateUnit.isPending || isUploadingImages;
  const isApt     = unitCategory === 'apartment';
  const T         = (ar: string, en: string) => language === 'ar' ? ar : en;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between bg-white">
          <h2 className="text-lg font-bold text-[#16100A]">
            {property ? t('properties.editProperty') : t('properties.addProperty')}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-[#555555]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 max-h-[82vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-x-5 gap-y-4">

            {/* 1. Unit Category */}
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium text-[#16100A]">{T('نوع الوحدة', 'Unit Category')} *</label>
              <div className="grid grid-cols-2 gap-3">
                {(['apartment', 'villa'] as const).map(cat => (
                  <button key={cat} type="button"
                    onClick={() => { setUnitCategory(cat); setRawCode(''); setParsed({ area:'', group:'', building:'', block:'', unit:'', floor:'', villaNumber:'' }); }}
                    className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all flex items-center justify-center gap-2
                      ${unitCategory === cat
                        ? 'border-[#B5752A] bg-[#FEF3E2] text-[#B5752A]'
                        : 'border-[#E5E5E5] text-[#555] hover:border-[#B5752A]/40'}`}>
                    <span>{cat === 'apartment' ? '🏢' : '🏡'}</span>
                    {cat === 'apartment' ? T('شقة', 'Apartment') : T('فيلا', 'Villa')}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. City */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{T('المدينة', 'City')} *</label>
              <input type="text" value={formData.city} required
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                placeholder={T('مثال: مدينتي، الرحاب', 'e.g., Madinaty, Rehab')}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm"
              />
            </div>

            {/* 3. Code */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">
                {T('الكود', 'Code')} *
                <span className="text-xs font-normal text-[#AAAAAA] mx-2">
                  {isApt ? T('مثال: 112/100/24', 'e.g., 112/100/24') : T('مثال: 11/123/4', 'e.g., 11/123/4')}
                </span>
              </label>
              <input type="text" value={rawCode} required dir="ltr"
                onChange={e => setRawCode(e.target.value)}
                placeholder={isApt ? '112/100/24' : '11/123/4'}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm font-mono"
              />
            </div>

            {/* ── Divider: Auto-filled ── */}
            {(parsed.area || parsed.group) && (
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-[#E5E5E5]" />
                  <span className="text-xs text-[#B5752A] font-medium px-2 bg-[#FEF3E2] rounded-full py-0.5">
                    {T('تم الاستخراج تلقائياً', 'Auto-extracted')} ✨
                  </span>
                  <div className="flex-1 h-px bg-[#E5E5E5]" />
                </div>
              </div>
            )}

            {/* 4. Auto fields */}
            {parsed.area      && <AutoField label={T('المنطقة', 'Area')}    value={parsed.area} />}
            {parsed.group     && <AutoField label={T('الجروب', 'Group')}   value={parsed.group} />}
            {isApt && parsed.building  && <AutoField label={T('المبنى', 'Building')}  value={parsed.building} />}
            {isApt && parsed.unit      && <AutoField label={T('رقم الشقة', 'Unit #')} value={parsed.unit} />}
            {isApt && parsed.floor     && <AutoField label={T('الدور', 'Floor')}      value={parsed.floor} />}
            {!isApt && parsed.block    && <AutoField label={T('البلوك', 'Block')}     value={parsed.block} />}
            {!isApt && parsed.villaNumber && <AutoField label={T('رقم الفيلا', 'Villa #')} value={parsed.villaNumber} />}

            {/* ── Divider: Unit details ── */}
            <div className="col-span-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-[#E5E5E5]" />
                <span className="text-xs text-[#888] px-2">{T('تفاصيل الوحدة', 'Unit Details')}</span>
                <div className="flex-1 h-px bg-[#E5E5E5]" />
              </div>
            </div>

            {/* Type — apartments only */}
            {isApt && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#16100A]">{T('نوع الشقة', 'Apt Type')} *</label>
                <select value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm bg-white" required>
                  <option value="apartment">{T('شقة', 'Apartment')}</option>
                  <option value="studio">{T('استوديو', 'Studio')}</option>
                  <option value="duplex">{T('دوبلكس', 'Duplex')}</option>
                  <option value="penthouse">{T('بنتهاوس', 'Penthouse')}</option>
                  <option value="roof">{T('روف', 'Roof')}</option>
                </select>
              </div>
            )}

            {/* Purpose */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('properties.purpose')} *</label>
              <select value={formData.purpose}
                onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm bg-white" required>
                <option value="sale">{t('properties.sale')}</option>
                <option value="resale">{t('properties.resale')}</option>
                <option value="rent">{t('properties.rent')}</option>
                <option value="commercial">{t('properties.commercial')}</option>
              </select>
            </div>

            {/* Project */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('properties.project', 'Project')} *</label>
              <SearchableDropdown
                key={`proj-${projectList.length}-${getProjectId(property?.project)}`}
                value={formData.project}
                onChange={id => setFormData({ ...formData, project: id })}
                options={projectOptions}
                placeholder={t('properties.selectProject', 'Select Project')}
                loading={isProjectsLoading}
                required={!property}
                initialLabel={projectInitialLabel}
              />
            </div>

            {/* Area select — for manual override */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">
                {t('properties.area')}
                <span className="text-xs font-normal text-[#AAAAAA] mx-1">{T('(تلقائي من الكود)', '(auto from code)')}</span>
              </label>
              <select value={parsed.area}
                onChange={e => setParsed({ ...parsed, area: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm bg-white">
                <option value="">{t('properties.selectArea') || 'Select Area'}</option>
                {areaList.map(a => (
                  <option key={a._id} value={a._id}>
                    {language === 'ar' ? (a.nameAr || a.name) : a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('properties.price')} (EGP) *</label>
              <input type="number" value={formData.price} dir="ltr" required
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                placeholder="2500000"
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm"
              />
            </div>

            {/* Size */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('properties.size')} (m²) *</label>
              <input type="number" min="0" value={formData.size} dir="ltr" required
                onChange={e => setFormData({ ...formData, size: e.target.value })}
                placeholder="180"
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm"
              />
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('properties.status')} *</label>
              <select value={formData.status} required
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm bg-white">
                <option value="available">{t('properties.available')}</option>
                <option value="reserved">{t('properties.reserved')}</option>
                <option value="sold">{t('properties.sold')}</option>
              </select>
            </div>

            {/* Bedrooms + Bathrooms — apartments only */}
            {isApt && <>
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#16100A]">{t('properties.bedrooms')}</label>
                <input type="number" value={formData.bedrooms} dir="ltr"
                  onChange={e => setFormData({ ...formData, bedrooms: e.target.value })}
                  placeholder="3"
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#16100A]">{t('properties.bathrooms')}</label>
                <input type="number" value={formData.bathrooms} dir="ltr"
                  onChange={e => setFormData({ ...formData, bathrooms: e.target.value })}
                  placeholder="2"
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm"
                />
              </div>
            </>}

            {/* Notes */}
            <div className="col-span-2 space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{T('ملاحظات', 'Notes')}</label>
              <textarea value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder={T('أي ملاحظات إضافية...', 'Any additional notes...')}
                rows={2}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm resize-none"
              />
            </div>

            {/* Images */}
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium text-[#16100A]">{t('properties.images')}</label>
              <p className="text-xs text-orange-500">⚠️ {T('يُسمح فقط بـ JPEG و WebP', 'Only JPEG & WebP allowed')}</p>
              <div className="flex flex-wrap gap-2">
                {existingImages.map((url, idx) => (
                  <div key={idx} className="relative group h-16 w-16 rounded-lg overflow-hidden border border-[#E5E5E5]">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeExistingImage(url)}
                      className="absolute top-0.5 right-0.5 p-0.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
                {previews.map((url, idx) => (
                  <div key={idx} className="relative group h-16 w-16 rounded-lg overflow-hidden border border-blue-200">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeNewFile(idx)}
                      className="absolute top-0.5 right-0.5 p-0.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
              <label className="inline-flex flex-col items-center justify-center gap-1 px-5 py-3 border border-dashed border-[#E5E5E5] rounded-lg cursor-pointer hover:bg-[#F7F7F7] transition-colors w-fit">
                <Upload className="w-5 h-5 text-[#555555]" />
                <span className="text-sm text-[#555555]">{t('properties.uploadImages') || 'Upload Images'}</span>
                <input type="file" multiple onChange={handleFileChange} className="hidden" accept="image/jpeg,image/jpg,image/webp" />
              </label>
            </div>

          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-[#E5E5E5]">
            <button type="button" onClick={onClose}
              className="px-6 py-2 border border-[#E5E5E5] rounded-lg text-sm text-[#555555] hover:bg-gray-50 transition-colors">
              {t('properties.cancel')}
            </button>
            <button type="submit" disabled={isPending}
              className="px-6 py-2 gradient-primary text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2">
              {isUploadingImages
                ? <><Loader2 className="w-4 h-4 animate-spin" />{T('جاري رفع الصور...', 'Uploading...')}</>
                : isPending ? '...'
                : property ? t('properties.saveChanges') : t('properties.addProperty')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}