import React, { useState } from 'react';
import { X, User, Phone, Mail, MapPin, FileText, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../../store/useConfigStore';

interface ClientModalProps {
  client?: any | null;
  onClose: () => void;
  onSave: (data: any) => void;
  isLoading?: boolean;
}

export function ClientModal({ client, onClose, onSave, isLoading }: ClientModalProps) {
  const { t, i18n } = useTranslation(['clients', 'common']);
  const { dir } = useConfigStore();
  const isRTL = dir === 'rtl';
  const language = i18n.language;

  // ✅ شيل الـ useEffect خالص - الـ useState بيتهيأ بالقيم مباشرة
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
    fullName:    client?.fullName || client?.name || '',
    phone:       getPhoneNumber(client?.phone || ''),
    phonePrefix: getPhonePrefix(client?.phone || ''),
    email:       client?.email   || '',
    city:        client?.city    || '',
    country:     client?.country || '',
    notes:       client?.notes   || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { phonePrefix, phone, ...rest } = formData;
    onSave({
      ...rest,
      phone: `${phonePrefix}${phone}`, // ✅ +201012345678
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
            {client ? t('clients.editClient') : t('clients.addClient')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[#F7F7F7] rounded-full transition-colors">
            <X className="w-5 h-5 text-[#555555]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">

            {/* Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className={`text-sm text-blue-800 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? '💡 يمكنك الكتابة بأي لغة' : '💡 You can write in any language'}
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'الاسم الكامل' : 'Full Name'} *
              </label>
              <div className="relative">
                <User className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]`} />
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`}
                  placeholder={language === 'ar' ? 'أحمد محمد' : 'Ahmed Mohamed'}
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
                <div className="relative flex">
                  {/* ✅ Country Code */}
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
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, phone: val });
                    }}
                    className="flex-1 px-3 py-2 border border-[#E5E5E5] rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm"
                    placeholder="1012345678"
                    dir="ltr"
                    maxLength={11}
                  />
                </div>
                <p className="text-xs text-[#AAAAAA] mt-1">
                  {language === 'ar' ? 'أدخل الرقم بدون مفتاح الدولة' : 'Enter number without country code'}
                </p>
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
                    placeholder="client@email.com"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* City & Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'المدينة' : 'City'} *
                </label>
                <div className="relative">
                  <MapPin className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]`} />
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`}
                    placeholder={language === 'ar' ? 'القاهرة' : 'Cairo'}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'الدولة' : 'Country'} *
                </label>
                <div className="relative">
                  <Globe className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]`} />
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                    className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`}
                    placeholder={language === 'ar' ? 'مصر' : 'Egypt'}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('common:common.notes')}
              </label>
              <div className="relative">
                <FileText className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 w-5 h-5 text-[#555555]`} />
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] min-h-[100px]`}
                  placeholder={language === 'ar' ? 'ملاحظات إضافية...' : 'Additional notes...'}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className={`flex items-center gap-3 mt-6 pt-6 border-t border-[#E5E5E5] ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 gradient-primary text-white py-3 rounded-lg hover:opacity-90 transition-all font-medium disabled:opacity-50"
            >
              {isLoading ? '...' : client ? t('common:common.update') : t('common:common.save')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#F7F7F7] text-[#555555] py-3 rounded-lg hover:bg-[#E5E5E5] transition-all font-medium"
            >
              {t('common:common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}