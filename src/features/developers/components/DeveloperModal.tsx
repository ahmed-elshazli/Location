import React, { useState } from 'react';
import { X, Building2, Phone, Mail, Globe, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../../store/useConfigStore';

interface DeveloperModalProps {
  developer?: any | null;
  onClose: () => void;
  onSave: (data: any) => void;
  isLoading?: boolean;
}

export function DeveloperModal({ developer, onClose, onSave, isLoading }: DeveloperModalProps) {
  const { t, i18n } = useTranslation(['common']);
  const { dir } = useConfigStore();
  const isRTL = dir === 'rtl';
  const language = i18n.language;

  const getPhoneNumber = (phone: string) => {
    if (!phone) return '';
    return phone.replace(/^\+20|^\+966/, '');
  };

  const getPhonePrefix = (phone: string) => {
    if (!phone) return '+20';
    if (phone.startsWith('+966')) return '+966';
    return '+20';
  };

  const [formData, setFormData] = useState({
    name:        developer?.name        || '',
    phone:       getPhoneNumber(developer?.phone || ''),
    phonePrefix: getPhonePrefix(developer?.phone || ''),
    email:       developer?.email       || '',
    site:        developer?.site        || '',
    location:    developer?.location    || '',
    description: developer?.description || '',
  });



  const [areaInput, setAreaInput] = useState('');
  const [areas, setAreas] = useState<string[]>(developer?.area || []);

  const addArea = () => {
    const trimmed = areaInput.trim();
    if (trimmed && !areas.includes(trimmed)) {
      setAreas(prev => [...prev, trimmed]);
      setAreaInput('');
    }
  };

  const removeArea = (val: string) => setAreas(prev => prev.filter(a => a !== val));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { phonePrefix, phone, ...rest } = formData;
    onSave({
      ...rest,
      phone: `${phonePrefix}${phone}`,
      area: areas,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b border-[#E5E5E5] sticky top-0 bg-white z-10 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h2 className={`text-xl font-bold text-[#16100A] ${isRTL ? 'text-right' : 'text-left'}`}>
            {developer
              ? (language === 'ar' ? 'تعديل المطور' : 'Edit Developer')
              : (language === 'ar' ? 'إضافة مطور' : 'Add Developer')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[#F7F7F7] rounded-full transition-colors">
            <X className="w-5 h-5 text-[#555555]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">

            {/* Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className={`text-sm text-blue-800 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar'
                  ? '💡 يمكنك الكتابة بأي لغة - سيتم الترجمة التلقائية للغة الأخرى'
                  : '💡 You can write in any language - auto-translation will handle the rest'}
              </p>
            </div>

            {/* Developer Name */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'اسم المطور' : 'Developer Name'} *
              </label>
              <div className="relative">
                <Building2 className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]`} />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`}
                  placeholder={language === 'ar' ? 'شركة التطوير العقاري' : 'Real Estate Development Co.'}
                />
              </div>
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Phone */}
              <div>
                <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'الهاتف' : 'Phone'} *
                </label>
                <div className="flex">
                  <select
                    value={formData.phonePrefix}
                    onChange={e => setFormData({ ...formData, phonePrefix: e.target.value })}
                    className="flex-shrink-0 px-2 py-2 bg-[#F7F7F7] border border-[#E5E5E5] rounded-l-lg text-sm text-[#555555] focus:outline-none focus:ring-2 focus:ring-[#B5752A] border-r-0"
                    dir="ltr"
                  >
                    <option value="+20">🇪🇬 +20</option>
                    <option value="+966">🇸🇦 +966</option>
                  </select>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    className="flex-1 px-3 py-2 border border-[#E5E5E5] rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm"
                    placeholder="100 123 4567"
                    dir="ltr"
                    maxLength={11}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <div className="relative">
                  <Mail className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]`} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`}
                    placeholder="info@developer.com"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>


            {/* Site */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'الموقع الإلكتروني' : 'Website'}
              </label>
              <div className="relative">
                <Globe className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]`} />
                <input
                  type="url"
                  value={formData.site}
                  onChange={e => setFormData({ ...formData, site: e.target.value })}
                  className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`}
                  placeholder="https://www.developer.com"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'العنوان' : 'Address'}
              </label>
              <div className="relative">
                <MapPin className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]`} />
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`}
                  placeholder={language === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt'}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'الوصف' : 'Description'}
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className={`w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] min-h-[90px] ${isRTL ? 'text-right' : 'text-left'}`}
                placeholder={language === 'ar' ? 'نبذة عن الشركة...' : 'About the company...'}
              />
            </div>


          </div>

          {/* Active Areas */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'المناطق النشطة' : 'Active Areas'}
              </label>
              {areas.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {areas.map((a: string) => (
                    <span key={a} className="flex items-center gap-1 px-3 py-1 bg-[#FEF3E2] text-[#B5752A] rounded-full text-sm font-medium border border-[#B5752A]/20">
                      {a}
                      <button type="button" onClick={() => removeArea(a)} className="hover:text-red-500 transition-colors ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={areaInput}
                  onChange={e => setAreaInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addArea(); } }}
                  className={`flex-1 px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm ${isRTL ? 'text-right' : 'text-left'}`}
                  placeholder={language === 'ar' ? 'أضف منطقة واضغط Enter' : 'Add area and press Enter'}
                />
                <button type="button" onClick={addArea}
                  className="px-4 py-2 bg-[#F7F7F7] text-[#555555] rounded-lg hover:bg-[#E5E5E5] text-sm font-medium transition-colors border border-[#E5E5E5]">
                  {language === 'ar' ? 'إضافة' : 'Add'}
                </button>
              </div>
            </div>

          {/* Actions */}
          <div className={`flex items-center gap-3 mt-6 pt-6 border-t border-[#E5E5E5] ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 gradient-primary text-white py-3 rounded-lg hover:opacity-90 transition-all font-medium disabled:opacity-50"
            >
              {isLoading ? '...' : developer ? t('common.update') : t('common.save')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#F7F7F7] text-[#555555] py-3 rounded-lg hover:bg-[#E5E5E5] transition-all font-medium"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}