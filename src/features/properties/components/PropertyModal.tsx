import React, { useState } from 'react';
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
  project?: { _id: string; name: string } | string;
  unitCode: string;
  floor?: number;
  apartmentNumber?: number;
  purpose: string;
  type: string;
  area: string;
  villaZone?: string;
  phase?: string;
  developer?: string;
  price: number;
  status: string;
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

export function PropertyModal({ property, onClose, onSave }: PropertyModalProps) {
  const { t, i18n } = useTranslation('properties');
  const { dir } = useConfigStore();
  const isRTL = dir === 'rtl';
  const language = i18n.language;

  const getProjectId = (project: any) => {
    if (typeof project === 'object' && project !== null) return project._id || project.id;
    return project;
  };

  const [formData, setFormData] = useState({
    unitCode:        property?.unitCode || '',
    floor:           property?.floor?.toString() || '',
    apartmentNumber: property?.apartmentNumber?.toString() || '',
    purpose:         property?.purpose?.toLowerCase() || 'sale',
    type:            property?.type?.toLowerCase() || 'apartment',
    area:            property?.area || '',
    villaZone:       property?.villaZone || '',
    phase:           property?.phase || '',
    developer:       property?.developer || 'Talaat Moustafa',
    price:           property?.price?.toString() || '',
    status:          property?.status?.toLowerCase() || 'available',
    bedrooms:        property?.bedrooms?.toString() || '',
    bathrooms:       property?.bathrooms?.toString() || '',
    size:            property?.size?.toString() || '',
    project:         getProjectId(property?.project) || '',
  });

  const [existingImages, setExistingImages] = useState<string[]>(property?.images || []);
  const [newFiles, setNewFiles]             = useState<File[]>([]);
  const [previews, setPreviews]             = useState<string[]>([]);

  const createUnit = useCreateUnit();
  const updateUnit = useUpdateUnit();
  const { triggerToast } = useToastStore();

  const { data: projectsData, isLoading: isProjectsLoading } = useProjects();
  const projectList = Array.isArray(projectsData?.data) ? projectsData.data : (Array.isArray(projectsData) ? projectsData : []);

  const { data: areasData } = useAreas?.() || { data: null };
  const areaList: { _id: string; name: string; nameAr?: string }[] = areasData?.data || areasData || [
    { _id: 'madinaty', name: 'Madinaty', nameAr: 'مدينتي' },
    { _id: 'rehab',    name: 'Rehab',    nameAr: 'الرحاب'  },
    { _id: 'celia',    name: 'Celia',    nameAr: 'سيليا'   },
    { _id: 'thousand', name: 'Thousand', nameAr: 'ألف مسكن' },
    { _id: 'sharmbay', name: 'Sharm Bay',nameAr: 'خليج شرم' },
  ];

  const villaZones = ['B1','B2','B3','B4','B5','B6','B7','B8','B9','B10','B11','B12'];
  const phases = ['B01','B02','B03','B04','B05','B06','B07','B08','B09','B010','B011','B012','B013','B014','B015','V02','V03','V04','V05','V06','V07'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    setNewFiles(prev => [...prev, ...filesArray]);
    setPreviews(prev => [...prev, ...filesArray.map(f => URL.createObjectURL(f))]);
  };

  const removeExistingImage = (url: string) => setExistingImages(prev => prev.filter(img => img !== url));
  const removeNewFile = (i: number) => {
    setNewFiles(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submissionData = new FormData();
    submissionData.append('unitCode',  formData.unitCode);
    submissionData.append('project',   formData.project);
    submissionData.append('type',      formData.type);
    submissionData.append('purpose',   formData.purpose);
    submissionData.append('status',    formData.status);
    submissionData.append('area',      formData.area);
    submissionData.append('price',     String(formData.price));
    submissionData.append('size',      String(formData.size));
    submissionData.append('bedrooms',  String(Math.max(0, Number(formData.bedrooms)  || 0)));
    submissionData.append('bathrooms', String(Math.max(0, Number(formData.bathrooms) || 0)));

    if (formData.phase)           submissionData.append('phase',           formData.phase);
    if (formData.floor)           submissionData.append('floor',           formData.floor);
    if (formData.apartmentNumber) submissionData.append('apartmentNumber', formData.apartmentNumber);
    if (formData.villaZone)       submissionData.append('villaZone',       formData.villaZone);

    // existing URLs
    existingImages.forEach(url => submissionData.append('images', url));
    // new files
    newFiles.forEach(file => submissionData.append('images', file));

    const mutateOptions = {
      onSuccess: () => {
        triggerToast(property ? 'تم التحديث ✅' : 'تمت الإضافة ✅', 'success');
        onClose();
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message;
        triggerToast(Array.isArray(msg) ? msg[0] : msg || (property ? 'فشل التحديث' : 'فشل الإضافة'), 'error');
      },
    };

    if (property) {
      updateUnit.mutate({ id: property._id || property.id, data: submissionData }, mutateOptions);
    } else {
      createUnit.mutate(submissionData, mutateOptions);
    }
  };

  const isPending = createUnit.isPending || updateUnit.isPending;

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

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-x-5 gap-y-4">

            {/* Unit Code */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('properties.unitCode')} *</label>
              <input type="text" value={formData.unitCode} dir="ltr" required
                onChange={(e) => {
                  const val = e.target.value;
                  let autoData = {};
                  if (formData.type === 'apartment') {
                    if (/^\d{2}$/.test(val))      autoData = { floor: val.charAt(0),       apartmentNumber: val.charAt(1) };
                    else if (/^\d{3}$/.test(val)) autoData = { floor: val.substring(0, 2), apartmentNumber: val.charAt(2) };
                  }
                  setFormData(prev => ({ ...prev, unitCode: val, ...autoData }));
                }}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm"
                placeholder="e.g., 34, B1-045"
              />
            </div>

            {/* Type */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('properties.type')} *</label>
              <select value={formData.type} required
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm bg-white"
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
              <select value={formData.purpose} required
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm bg-white"
              >
                <option value="sale">{t('properties.sale')}</option>
                <option value="resale">{t('properties.resale')}</option>
                <option value="rent">{t('properties.rent')}</option>
                <option value="commercial">{t('properties.commercial')}</option>
              </select>
            </div>

            {/* Project */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('properties.project', 'Project')} *</label>
              <select value={formData.project} required
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm bg-white"
              >
                <option value="">{isProjectsLoading ? '...' : t('properties.selectProject', 'Select Project')}</option>
                {projectList.map((p: any) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Area */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('properties.area')} *</label>
              <select value={formData.area} required
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm bg-white"
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
              <select value={formData.phase}
                onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm bg-white"
              >
                <option value="">{t('properties.selectPhase')}</option>
                {phases.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Floor */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('properties.floor')}</label>
              <input type="text" value={formData.floor} readOnly dir="ltr"
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg bg-[#F7F7F7] text-sm text-[#AAAAAA]"
                placeholder={t('properties.autoExtracted')}
              />
            </div>

            {/* Apartment Number */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('properties.apartmentNumber')}</label>
              <input type="text" value={formData.apartmentNumber} readOnly dir="ltr"
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg bg-[#F7F7F7] text-sm text-[#AAAAAA]"
                placeholder={t('properties.autoExtracted')}
              />
            </div>

            {/* Developer */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('properties.developer')} *</label>
              <input type="text" value={formData.developer} required
                onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm"
              />
            </div>

            {/* Price */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('properties.price')} (EGP) *</label>
              <input type="number" value={formData.price} dir="ltr" required
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm"
                placeholder="e.g., 2500000"
              />
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('properties.status')} *</label>
              <select value={formData.status} required
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm bg-white"
              >
                <option value="available">{t('properties.available')}</option>
                <option value="reserved">{t('properties.reserved')}</option>
                <option value="sold">{t('properties.sold')}</option>
              </select>
            </div>

            {/* Size */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#16100A]">{t('properties.size')} (m²) *</label>
              <input type="number" min="0" value={formData.size} dir="ltr" required
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm"
                placeholder="e.g., 180"
              />
            </div>

            {/* Bedrooms */}
            {formData.type !== 'commercial' && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#16100A]">{t('properties.bedrooms')} *</label>
                <input type="number" value={formData.bedrooms} dir="ltr"
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm"
                  placeholder="e.g., 3"
                />
              </div>
            )}

            {/* Bathrooms */}
            {formData.type !== 'commercial' && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#16100A]">{t('properties.bathrooms')} *</label>
                <input type="number" value={formData.bathrooms} dir="ltr"
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm"
                  placeholder="e.g., 2"
                />
              </div>
            )}

            {/* Villa Zone */}
            {formData.type === 'villa' && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#16100A]">{t('properties.villaZone')}</label>
                <select value={formData.villaZone}
                  onChange={(e) => setFormData({ ...formData, villaZone: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm bg-white"
                >
                  <option value="">{t('properties.selectZone')}</option>
                  {villaZones.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
            )}

            {/* Images — file upload */}
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium text-[#16100A]">{t('properties.images')}</label>

              {(existingImages.length > 0 || previews.length > 0) && (
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
              )}

              <label className="inline-flex flex-col items-center justify-center gap-1 px-5 py-3 border border-dashed border-[#E5E5E5] rounded-lg cursor-pointer hover:bg-[#F7F7F7] transition-colors w-fit">
                <Upload className="w-5 h-5 text-[#555555]" />
                <span className="text-sm text-[#555555]">{t('properties.uploadImages') || 'Upload Images'}</span>
                <input type="file" multiple onChange={handleFileChange} className="hidden" accept="image/jpeg,image/jpg,image/webp,image/png" />
              </label>
            </div>

          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-[#E5E5E5]">
            <button type="button" onClick={onClose}
              className="px-6 py-2 border border-[#E5E5E5] rounded-lg text-sm text-[#555555] hover:bg-gray-50 transition-colors"
            >
              {t('properties.cancel')}
            </button>
            <button type="submit" disabled={isPending}
              className="px-6 py-2 gradient-primary text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {isPending ? '...' : property ? t('properties.saveChanges') : t('properties.addProperty')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}