import React, { useState } from 'react';
import { X } from 'lucide-react'; // ✅ حل مشكلة أيقونة X
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../../store/useConfigStore';

// ✅ 1. تعريف الـ Interface خارج الكومبوننت ليكون متاحاً للـ Props
export interface Area {
  _id?: string;
  id?: string;
  name: string;
  nameAr?: string;
  city?: string;
  cityAr?: string;
  // zone?: string;
  // group?: string;
  groupAr?: string;
  // type: string;
  // units?: number;
  // availableUnits?: number;
  description?: string;
  descriptionAr?: string;
}

// ✅ 2. تعريف الـ Props بناءً على الـ Interface
interface AreaModalProps {
  area: Area | null;
  onClose: () => void;
  onSave: (data: Partial<Area>) => void;
  isPending: boolean;
}

export default function AreaModal({ area, onClose, onSave, isPending }: AreaModalProps) {
  const { t } = useTranslation(['areas', 'common']);
  const { dir } = useConfigStore();
  const isRTL = dir === 'rtl';

  // ✅ 3. تهيئة الـ State مع استخدام الـ Interface المحدث
  const [formData, setFormData] = useState<Partial<Area>>({
    name:            area?.name            || '',
    nameAr:          area?.nameAr          || '',
    city:            area?.city            || '',
    cityAr:          area?.cityAr          || '',
    // zone:            area?.zone            || '',
    // group:           area?.group           || '',
    groupAr:         area?.groupAr         || '',
    // type:            area?.type            || 'Villa Zone',
    // units:           area?.units           || 0,
    // availableUnits:  area?.availableUnits  || 0,
    description:     area?.description     || '',
    descriptionAr:   area?.descriptionAr   || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between bg-white">
          <h2 className="text-xl font-bold text-[#16100A]">
            {area ? t('areas.editArea') : t('areas.addArea')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-[#555555]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('areas.name')} *</label>
            <input required value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none text-sm" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('areas.nameAr')}</label>
            <input value={formData.nameAr} dir="rtl"
              onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none text-sm" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('areas.city')} *</label>
            <input required value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none text-sm" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('areas.cityAr')}</label>
            <input value={formData.cityAr} dir="rtl"
              onChange={(e) => setFormData({ ...formData, cityAr: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none text-sm" />
          </div>

          {/* <div className="space-y-1">
            <label className="text-sm font-medium">{t('areas.type')} *</label>
            <select required value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Area['type'] })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none text-sm bg-white">
              <option value="Villa Zone">{t('areas:villaZone')}</option>
              <option value="Apartment Zone">{t('areas:apartmentZone')}</option>
              <option value="Service Area">{t('areas:serviceArea')}</option>
              <option value="Mixed">{t('areas:mixed')}</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('areas.zone')}</label>
            <input value={formData.zone} placeholder="e.g. B1"
              onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none text-sm" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('areas.group')}</label>
            <input value={formData.group}
              onChange={(e) => setFormData({ ...formData, group: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none text-sm" />
          </div> */}

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('areas.groupAr')}</label>
            <input value={formData.groupAr} dir="rtl"
              onChange={(e) => setFormData({ ...formData, groupAr: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none text-sm" />
          </div>

          {/* <div className="space-y-1">
            <label className="text-sm font-medium">{t('areas.totalUnits')}</label>
            <input type="number" min="0" value={formData.units}
              onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none text-sm" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('areas.availableUnits')}</label>
            <input type="number" min="0" value={formData.availableUnits}
              onChange={(e) => setFormData({ ...formData, availableUnits: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none text-sm" />
          </div> */}

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium">{t('common:common.description')}</label>
            <textarea value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none text-sm h-20" />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium">{t('areas.descriptionAr')}</label>
            <textarea value={formData.descriptionAr} dir="rtl"
              onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none text-sm h-20" />
          </div>

          {/* Footer */}
          <div className="md:col-span-2 pt-4 flex justify-end gap-3 border-t mt-2">
            <button type="button" onClick={onClose}
              className="px-6 py-2 border rounded-lg hover:bg-gray-100 transition-colors text-sm">
              {t('common:common.cancel')}
            </button>
            <button type="submit" disabled={isPending}
              className="px-8 py-2 gradient-primary text-white rounded-lg font-bold disabled:opacity-50 text-sm">
              {isPending ? '...' : area ? t('common:common.update') : t('common:common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}