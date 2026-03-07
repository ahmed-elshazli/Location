import React, { useState } from 'react';
import { X, User, Phone, Mail, Tag, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../../store/useConfigStore';
import { useUsers } from '../../users/hooks/useUsers';

interface LeadModalProps {
  lead?: any | null;
  onClose: () => void;
  onSave: (data: any) => void;
  isLoading?: boolean;
}

const SOURCES = [
  'WEBSITE', 'FACEBOOK', 'INSTAGRAM', 'REFERRAL',
  'WALK_IN', 'PHONE_CALL', 'DATA_OFFICE', 'OTHER'
];

export function LeadModal({ lead, onClose, onSave, isLoading }: LeadModalProps) {
  const { t, i18n } = useTranslation(['leads', 'common']);
  const { dir }     = useConfigStore();
  const isRTL       = dir === 'rtl';
  const language    = i18n.language;

  const { data: usersData } = useUsers();
  const users = Array.isArray(usersData?.data) ? usersData.data
    : Array.isArray(usersData)                 ? usersData
    : [];

  const [formData, setFormData] = useState({
    fullName:     lead?.fullName     || '',
    phone:        lead?.phone        || '',
    email:        lead?.email        || '',
    source:       lead?.source       || 'WEBSITE',
    assignedTo:   typeof lead?.assignedTo === 'object'
                    ? (lead?.assignedTo?._id || lead?.assignedTo?.id || '')
                    : (lead?.assignedTo || ''),
    status:       lead?.status       || 'NEW',
    notes:        lead?.notes        || '',
    interestedIn: lead?.interestedIn || '',
  });

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'WEBSITE':     return language === 'ar' ? 'الموقع'        : 'Website';
      case 'FACEBOOK':    return language === 'ar' ? 'فيسبوك'        : 'Facebook';
      case 'INSTAGRAM':   return language === 'ar' ? 'إنستجرام'      : 'Instagram';
      case 'REFERRAL':    return language === 'ar' ? 'إحالة'         : 'Referral';
      case 'WALK_IN':     return language === 'ar' ? 'زيارة مباشرة'  : 'Walk-in';
      case 'PHONE_CALL':  return language === 'ar' ? 'مكالمة هاتفية' : 'Phone Call';
      case 'DATA_OFFICE': return language === 'ar' ? 'مكتب البيانات' : 'Data Office';
      case 'OTHER':       return language === 'ar' ? 'أخرى'          : 'Other';
      default:            return source;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ فقط الـ fields اللي السيرفر بيقبلها
    const payload: any = {
      fullName: formData.fullName,
      phone:    formData.phone,
      source:   formData.source,
      status:   formData.status,
    };

    if (formData.email)        payload.email        = formData.email;
    if (formData.assignedTo)   payload.assignedTo   = formData.assignedTo;
    if (formData.notes)        payload.notes        = formData.notes;
    if (formData.interestedIn) payload.interestedIn = formData.interestedIn;

    onSave(payload);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={e => e.stopPropagation()}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className={`sticky top-0 bg-white border-b border-[#E5E5E5] px-6 py-4 flex items-center justify-between z-10 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h2 className="font-bold text-[#16100A] text-lg">
            {lead
              ? (language === 'ar' ? 'تعديل ليد' : 'Edit Lead')
              : (language === 'ar' ? 'إضافة ليد جديد' : 'Add New Lead')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[#F7F7F7] rounded-full transition-colors">
            <X className="w-5 h-5 text-[#555555]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Full Name */}
            <div className="md:col-span-2">
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

            {/* Phone */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'} *
              </label>
              <div className="relative">
                <Phone className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]`} />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`}
                  placeholder="+20 100 123 4567"
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
                  placeholder="email@example.com"
                />
              </div>
            </div>

            {/* Source */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'المصدر' : 'Source'} *
              </label>
              <select
                required
                value={formData.source}
                onChange={e => setFormData({ ...formData, source: e.target.value })}
                className={`w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] ${isRTL ? 'text-right' : 'text-left'}`}
              >
                {SOURCES.map(s => (
                  <option key={s} value={s}>{getSourceLabel(s)}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'الحالة' : 'Status'} *
              </label>
              <select
                required
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className={`w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] ${isRTL ? 'text-right' : 'text-left'}`}
              >
                <option value="NEW">           {language === 'ar' ? 'جديد'        : 'New'}           </option>
                <option value="CONTACTED">     {language === 'ar' ? 'تم التواصل'  : 'Contacted'}     </option>
                <option value="INTERESTED">    {language === 'ar' ? 'مهتم'        : 'Interested'}    </option>
                <option value="NOT_INTERESTED">{language === 'ar' ? 'غير مهتم'   : 'Not Interested'}</option>
                <option value="CONVERTED">     {language === 'ar' ? 'تحول لعميل' : 'Converted'}     </option>
              </select>
            </div>

            {/* Assigned To */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'المسؤول' : 'Assigned To'}
              </label>
              <div className="relative">
                <User className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]`} />
                <select
                  value={formData.assignedTo}
                  onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                  className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`}
                >
                  <option value="">{language === 'ar' ? 'اختر موظف...' : 'Select staff...'}</option>
                  {users.map((u: any) => (
                    <option key={u._id || u.id} value={u._id || u.id}>
                      {u.fullName || u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Interested In */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'مهتم بـ' : 'Interested In'}
              </label>
              <div className="relative">
                <Tag className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]`} />
                <input
                  type="text"
                  value={formData.interestedIn}
                  onChange={e => setFormData({ ...formData, interestedIn: e.target.value })}
                  className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`}
                  placeholder={language === 'ar' ? 'شقة في مدينتي' : 'Apartment in Madinaty'}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'ملاحظات' : 'Notes'}
              </label>
              <div className="relative">
                <FileText className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 w-5 h-5 text-[#555555]`} />
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] min-h-[90px]`}
                  placeholder={language === 'ar' ? 'أي ملاحظات إضافية...' : 'Any additional notes...'}
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
              {isLoading ? '...' : lead
                ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes')
                : (language === 'ar' ? 'إضافة ليد'     : 'Add Lead')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#F7F7F7] text-[#555555] py-3 rounded-lg hover:bg-[#E5E5E5] transition-all font-medium"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}