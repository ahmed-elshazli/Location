import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // ✅ البديل الصحيح
import { useConfigStore } from '../../../store/useConfigStore'; // ✅ لجلب الاتجاه

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
}

interface PropertyModalProps {
  property: Property | null;
  onClose: () => void;
  onSave: (property: Partial<Property>) => void;
}

export function PropertyModal({ property, onClose, onSave }: PropertyModalProps) {
  // ✅ ربط المتغيرات بالسيستم الجديد
  const { t, i18n } = useTranslation('properties'); 
  const { dir } = useConfigStore(); 
  
  const isRTL = dir === 'rtl'; // ✅ المتغير المستخدم في الـ UI
  const language = i18n.language; // ✅ المتغير المستخدم في الـ UI

  const [formData, setFormData] = useState({
    unitCode: property?.unitCode || '',
    floor: property?.floor?.toString() || '',
    apartment: property?.apartment?.toString() || '',
    purpose: property?.purpose || 'Sale',
    constructionStatus: property?.constructionStatus || 'Ready',
    type: property?.type || 'Apartment',
    area: property?.area || 'Madinaty',
    villaZone: property?.villaZone || '',
    phase: property?.phase || '',
    developer: property?.developer || 'Talaat Moustafa',
    price: property?.price?.toString() || '',
    status: property?.status || 'Available',
    bedrooms: property?.bedrooms?.toString() || '',
    bathrooms: property?.bathrooms?.toString() || '',
    size: property?.size?.toString() || '',
  });

  // ✅ الحفاظ على منطق استخراج رقم الدور والشقة الذكي
  useEffect(() => {
    const unitCode = formData.unitCode;
    if (/^\d{2}$/.test(unitCode) && formData.type === 'Apartment') {
      const floor = unitCode.charAt(0);
      const apt = unitCode.charAt(1);
      setFormData(prev => ({ ...prev, floor: floor, apartment: apt }));
    } else if (/^\d{3}$/.test(unitCode) && formData.type === 'Apartment') {
      const floor = unitCode.substring(0, 2);
      const apt = unitCode.charAt(2);
      setFormData(prev => ({ ...prev, floor: floor, apartment: apt }));
    }
  }, [formData.unitCode, formData.type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as any);
  };

  const areas = ['Madinaty', 'Rehab', 'Celia', 'Thousand', 'Sharm Bay'];
  const villaZones = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'B12'];
  const phases = ['B01', 'B02', 'B03', 'B04', 'B05', 'B06', 'B07', 'B08', 'B09', 'B010', 'B011', 'B012', 'B013', 'B014', 'B015', 'V02', 'V03', 'V04', 'V05', 'V06', 'V07'];
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className={`sticky top-0 bg-white border-b border-[#E5E5E5] px-6 py-4 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h2 className="font-bold text-[#16100A]">
            {property ? t('properties.editProperty') : t('properties.addProperty')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#555555]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Unit Code */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('properties.unitCode')} *
              </label>
              <input
                type="text"
                value={formData.unitCode}
                onChange={(e) => setFormData({ ...formData, unitCode: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]"
                placeholder={isRTL ? 'مثال: 34, B1-045, COM-012' : 'e.g., 34, B1-045, COM-012'}
                required
                dir="ltr"
              />
              <p className={`text-xs text-[#555555] mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('properties.unitCodeHint')}
              </p>
            </div>

            {/* Type */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('properties.type')} *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]"
                required
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <option value="Apartment">{t('properties.apartment')}</option>
                <option value="Villa">{t('properties.villa')}</option>
                <option value="Commercial">{t('properties.commercial')}</option>
                <option value="Leisure">{t('properties.leisure')}</option>
              </select>
            </div>

            {/* Purpose */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('properties.purpose')} *
              </label>
              <select
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value as any })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]"
                required
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <option value="Sale">{t('properties.sale')}</option>
                <option value="Resale">{t('properties.resale')}</option>
                <option value="Rent">{t('properties.rent')}</option>
                <option value="Commercial">{t('properties.commercial')}</option>
              </select>
            </div>

            {/* Construction Status (for Commercial) */}
            {formData.purpose === 'Commercial' && (
              <div>
                <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('properties.constructionStatus')} *
                </label>
                <select
                  value={formData.constructionStatus}
                  onChange={(e) => setFormData({ ...formData, constructionStatus: e.target.value as any })}
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]"
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <option value="Ready">{t('properties.ready')}</option>
                  <option value="Under Construction">{t('properties.underConstruction')}</option>
                </select>
              </div>
            )}

            {/* Area */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('properties.area')} *
              </label>
              <select
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]"
                required
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                {areas.map(area => (
                  <option key={area} value={area}>
                    {language === 'ar' ? (
                      area === 'Madinaty' ? 'مدينتي' :
                      area === 'Rehab' ? 'الرحاب' :
                      area === 'Celia' ? 'سيليا' :
                      area === 'Thousand' ? 'ألف مسكن' :
                      area === 'Sharm Bay' ? 'خليج شرم' : area
                    ) : area}
                  </option>
                ))}
              </select>
            </div>

            {/* Villa Zone (for Villas only) */}
            {formData.type === 'Villa' && (
              <div>
                <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('properties.villaZone')}
                </label>
                <select
                  value={formData.villaZone}
                  onChange={(e) => setFormData({ ...formData, villaZone: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]"
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <option value="">{t('properties.selectZone')}</option>
                  {villaZones.map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Phase (for Apartments) */}
            {formData.type === 'Apartment' && (
              <div>
                <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('properties.phase')}
                </label>
                <select
                  value={formData.phase}
                  onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]"
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <option value="">{t('properties.selectPhase')}</option>
                  {phases.map(phase => (
                    <option key={phase} value={phase}>{phase}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Floor (for Apartments, auto-filled) */}
            {formData.type === 'Apartment' && (
              <div>
                <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('properties.floor')}
                </label>
                <input
                  type="text"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] bg-[#F7F7F7]"
                  placeholder={t('properties.autoExtracted')}
                  readOnly
                  dir="ltr"
                />
              </div>
            )}

            {/* Apartment Number (for Apartments, auto-filled) */}
            {formData.type === 'Apartment' && (
              <div>
                <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('properties.apartmentNumber')}
                </label>
                <input
                  type="text"
                  value={formData.apartment}
                  onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] bg-[#F7F7F7]"
                  placeholder={t('properties.autoExtracted')}
                  readOnly
                  dir="ltr"
                />
              </div>
            )}

            {/* Developer */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('properties.developer')} *
              </label>
              <input
                type="text"
                value={formData.developer}
                onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]"
                required
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>

            {/* Price */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('properties.price')} ({t('properties.egp')}) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]"
                placeholder={isRTL ? 'مثال: 2500000' : 'e.g., 2500000'}
                required
                dir="ltr"
              />
            </div>

            {/* Status */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('properties.status')} *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]"
                required
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <option value="Available">{t('properties.available')}</option>
                <option value="Reserved">{t('properties.reserved')}</option>
                <option value="Sold">{t('properties.sold')}</option>
              </select>
            </div>

            {/* Size */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('properties.size')} ({t('properties.sqm')}) *
              </label>
              <input
                type="number"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]"
                placeholder={isRTL ? 'مثال: 180' : 'e.g., 180'}
                required
                dir="ltr"
              />
            </div>

            {/* Bedrooms (not for Commercial) */}
            {formData.type !== 'Commercial' && (
              <div>
                <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('properties.bedrooms')}
                </label>
                <input
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]"
                  placeholder={isRTL ? 'مثال: 3' : 'e.g., 3'}
                  dir="ltr"
                />
              </div>
            )}

            {/* Bathrooms (not for Commercial) */}
            {formData.type !== 'Commercial' && (
              <div>
                <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('properties.bathrooms')}
                </label>
                <input
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]"
                  placeholder={isRTL ? 'مثال: 2' : 'e.g., 2'}
                  dir="ltr"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className={`flex items-center gap-3 mt-8 pt-6 border-t border-[#E5E5E5] ${isRTL ? 'flex-row-reverse justify-end' : 'justify-end'}`}>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-[#E5E5E5] rounded-lg text-[#555555] hover:bg-[#F7F7F7] transition-colors"
            >
              {t('properties.cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 gradient-primary text-white rounded-lg hover:opacity-90 transition-all"
            >
              {property ? t('properties.saveChanges') : t('properties.addProperty')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}