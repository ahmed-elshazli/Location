import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, MapPin, FileText, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../../store/useConfigStore';
import { useAllClients } from '../../clients/hooks/useAllClients';
import { useUsers } from '../../users/hooks/useUsers';
import { useToastStore } from '../../../store/useToastStore';

interface EventModalProps {
  event?: any | null;
  show: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  isLoading?: boolean;
}

// ✅ تحويل "03:06 PM" → "15:06" عشان input type="time" يقبله
const convertTo24h = (time: string): string => {
  if (!time) return '';
  // لو بالفعل 24h format مش محتاج تحويل
  if (!time.includes('AM') && !time.includes('PM')) return time.slice(0, 5);
  const [timePart, modifier] = time.split(' ');
  let [hours, minutes] = timePart.split(':');
  let h = parseInt(hours, 10);
  if (modifier === 'AM' && h === 12) h = 0;
  if (modifier === 'PM' && h !== 12) h += 12;
  return `${String(h).padStart(2, '0')}:${minutes}`;
};

const getEventFormData = (event: any) => ({
  title:      event?.title      || '',
  type:       event?.type       || 'PROPERTY_VIEWING',
  date:       event?.date?.split('T')[0] || '',
  time:       convertTo24h(event?.time || ''),
  location:   event?.location   || '',
  client:     typeof event?.client === 'object'
                ? (event?.client?._id     || event?.client?.id     || '')
                : (event?.client          || ''),
  assignedTo: typeof event?.assignedTo === 'object'
                ? (event?.assignedTo?._id || event?.assignedTo?.id || '')
                : (event?.assignedTo      || ''),
  notes:      event?.notes      || '',
});

export function EventModal({ event, show, onClose, onSave, isLoading }: EventModalProps) {
  const { t, i18n }      = useTranslation(['calendar', 'common']);
  const { dir }          = useConfigStore();
  const { triggerToast } = useToastStore();
  const isRTL            = dir === 'rtl';
  const language         = i18n.language;

  const { data: clientsData } = useAllClients();
  const { data: usersData }   = useUsers();

  const clients = Array.isArray(clientsData?.data) ? clientsData.data
    : Array.isArray(clientsData)                   ? clientsData
    : [];

  const users = Array.isArray(usersData?.data) ? usersData.data
    : Array.isArray(usersData)                 ? usersData
    : [];

  const [formData, setFormData] = useState(getEventFormData(event));

  // ✅ لما الـ event يتغير (فتح تعديل حدث مختلف) حدّث الـ form
  useEffect(() => {
    setFormData(getEventFormData(event));
  }, [event?._id || event?.id, show]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client) {
      triggerToast(language === 'ar' ? 'اختر عميل' : 'Please select a client', 'error');
      return;
    }
    if (!formData.assignedTo) {
      triggerToast(language === 'ar' ? 'اختر موظف مسؤول' : 'Please select assigned user', 'error');
      return;
    }

    const payload: any = {
      title:      formData.title,
      type:       formData.type,
      date:       formData.date,
      time:       formData.time,
      client:     formData.client,
      assignedTo: formData.assignedTo,
    };

    if (formData.location) payload.location = formData.location;
    if (formData.notes)    payload.notes    = formData.notes;

    onSave(payload);
  };

  const today = new Date().toISOString().split('T')[0];

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b border-[#E5E5E5] sticky top-0 bg-white z-10 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h2 className={`text-xl font-bold text-[#16100A] ${isRTL ? 'text-right' : 'text-left'}`}>
            {event
              ? (language === 'ar' ? 'تعديل حدث' : 'Edit Event')
              : (language === 'ar' ? 'إضافة حدث' : 'Add Event')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[#F7F7F7] rounded-full transition-colors">
            <X className="w-5 h-5 text-[#555555]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">

            {/* Title */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'عنوان الحدث' : 'Event Title'} *
              </label>
              <div className="relative">
                <Tag className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]`} />
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`}
                  placeholder={language === 'ar' ? 'معاينة عقار - فيلا ب12' : 'Property Viewing - Villa B12'}
                />
              </div>
            </div>

            {/* Type & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'نوع الحدث' : 'Event Type'} *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className={`w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] ${isRTL ? 'text-right' : 'text-left'}`}
                >
                  <option value="PROPERTY_VIEWING">{language === 'ar' ? 'زيارة عقار'  : 'Property Viewing'}</option>
                  <option value="CLIENT_MEETING">  {language === 'ar' ? 'اجتماع عميل' : 'Client Meeting'}  </option>
                  <option value="DEAL_CLOSING">    {language === 'ar' ? 'إغلاق صفقة'  : 'Deal Closing'}    </option>
                  <option value="FOLLOW_UP">       {language === 'ar' ? 'متابعة'       : 'Follow Up'}       </option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'التاريخ' : 'Date'} *
                </label>
                <div className="relative">
                  <Calendar className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]`} />
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`}
                  />
                </div>
              </div>
            </div>

            {/* Time & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'الوقت' : 'Time'} *
                </label>
                <div className="relative">
                  <Clock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]`} />
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'الموقع' : 'Location'}
                </label>
                <div className="relative">
                  <MapPin className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]`} />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`}
                    placeholder={language === 'ar' ? 'مدينتي، القاهرة' : 'Madinaty, Cairo'}
                  />
                </div>
              </div>
            </div>

            {/* Client & Assigned To */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'العميل' : 'Client'} *
                </label>
                <div className="relative">
                  <User className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]`} />
                  <select
                    value={formData.client}
                    onChange={e => setFormData({ ...formData, client: e.target.value })}
                    className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`}
                  >
                    <option value="">{language === 'ar' ? 'اختر عميل...' : 'Select client...'}</option>
                    {clients.map((c: any) => (
                      <option key={c._id || c.id} value={c._id || c.id}>
                        {c.fullName || c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'المسؤول' : 'Assigned To'} *
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
            </div>

            {/* Notes */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'ملاحظات' : 'Notes'}
              </label>
              <div className="relative">
                <FileText className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 w-5 h-5 text-[#555555]`} />
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] min-h-[90px]`}
                  placeholder={language === 'ar' ? 'أي معلومات إضافية...' : 'Any additional information...'}
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
              {isLoading ? '...' : event ? t('common:common.update') : t('common:common.save')}
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