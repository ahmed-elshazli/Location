import React, { useState } from 'react';
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, User as UserIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // ✅ البديل الصحيح
import { useConfigStore } from '../../store/useConfigStore'; // ✅ لجلب الاتجاه
import { useAuthStore } from '../../store/useAuthStore'; // ✅ لجلب بيانات المستخدم

// ... (واجهة CalendarEvent ومصفوفة mockEvents تبقى كما هي تماماً)
interface CalendarEvent {
  id: string;
  title: string;
  titleAr: string;
  type: 'Property Viewing' | 'Client Meeting' | 'Deal Closing' | 'Follow Up';
  date: Date;
  time: string;
  client: string;
  clientAr: string;
  location?: string;
  locationAr?: string;
  assignedTo: string;
  assignedToAr: string;
}

const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Property Viewing - Villa B12',
    titleAr: 'زيارة عقار - فيلا ب12',
    type: 'Property Viewing',
    date: new Date(2026, 1, 20, 10, 0),
    time: '10:00 AM',
    client: 'Ahmed Hassan',
    clientAr: 'أحمد حسن',
    location: 'Madinaty, B12 Zone',
    locationAr: 'مدينتي، منطقة ب12',
    assignedTo: 'Sarah Ahmed',
    assignedToAr: 'سارة أحمد',
  },
  {
    id: '2',
    title: 'Client Meeting - Investment Discussion',
    titleAr: 'اجتماع عميل - مناقشة استثمار',
    type: 'Client Meeting',
    date: new Date(2026, 1, 20, 14, 0),
    time: '2:00 PM',
    client: 'Mohamed Ali',
    clientAr: 'محمد علي',
    location: 'Office',
    locationAr: 'المكتب',
    assignedTo: 'Khaled Mohamed',
    assignedToAr: 'خالد محمد',
  },
  {
    id: '3',
    title: 'Deal Closing - Apartment Sale',
    titleAr: 'إغلاق صفقة - بيع شقة',
    type: 'Deal Closing',
    date: new Date(2026, 1, 21, 11, 0),
    time: '11:00 AM',
    client: 'Fatma Ibrahim',
    clientAr: 'فاطمة إبراهيم',
    location: 'Notary Office',
    locationAr: 'مكتب التوثيق',
    assignedTo: 'Sarah Ahmed',
    assignedToAr: 'سارة أحمد',
  },
  {
    id: '4',
    title: 'Follow Up - Rehab Project',
    titleAr: 'متابعة - مشروع الرحاب',
    type: 'Follow Up',
    date: new Date(2026, 1, 22, 15, 30),
    time: '3:30 PM',
    client: 'Omar Youssef',
    clientAr: 'عمر يوسف',
    assignedTo: 'Laila Hassan',
    assignedToAr: 'ليلى حسن',
  },
  {
    id: '5',
    title: 'Property Viewing - Celia Tower',
    titleAr: 'زيارة عقار - برج سيليا',
    type: 'Property Viewing',
    date: new Date(2026, 1, 23, 10, 30),
    time: '10:30 AM',
    client: 'Nour Samir',
    clientAr: 'نور سمير',
    location: 'Celia, Fifth Settlement',
    locationAr: 'سيليا، التجمع الخامس',
    assignedTo: 'Khaled Mohamed',
    assignedToAr: 'خالد محمد',
  },
];
export default function Calendar() { // ✅ شلنا الـ Props لتعارضها مع نظام الـ Store الحالي
  const [currentDate, setCurrentDate] = useState(new Date());

  // ✅ ربط المتغيرات بالسيستم الجديد
  const { t, i18n } = useTranslation(['calendar', 'leads']); 
  const { dir } = useConfigStore(); 
  const { user } = useAuthStore();
  
  const isRTL = dir === 'rtl'; // ✅ المتغير المستخدم في الـ UI
  const language = i18n.language; // ✅ المتغير المستخدم في الـ UI

  // --- الحفاظ على كل الدوال الحسابية كما هي حرفياً ---
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const previousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthNames = language === 'ar' 
    ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const dayNames = language === 'ar'
    ? ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventsForDay = (day: number) => {
    return mockEvents.filter(event => {
      return event.date.getDate() === day &&
             event.date.getMonth() === currentDate.getMonth() &&
             event.date.getFullYear() === currentDate.getFullYear();
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear();
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'Property Viewing': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Client Meeting': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Deal Closing': return 'bg-green-50 text-green-700 border-green-200';
      case 'Follow Up': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'Property Viewing': return t('calendar.propertyViewing');
      case 'Client Meeting': return t('calendar.clientMeeting');
      case 'Deal Closing': return t('calendar.dealClosing');
      case 'Follow Up': return t('calendar.followUp');
      default: return type;
    }
  };

  const upcomingEvents = mockEvents
    .filter(event => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);
  return (
    <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h1 className="text-2xl font-bold text-[#16100A] mb-2">{t('calendar.title')}</h1>
            <p className="text-[#555555]">{t('calendar.subtitle')}</p>
          </div>
          <button className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all">
            <Plus className="w-5 h-5" />
            {t('calendar.addEvent')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
            {/* Calendar Header */}
            <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <h2 className="font-bold text-xl text-[#16100A]">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToToday}
                  className="px-4 py-2 text-sm bg-[#F7F7F7] text-[#555555] rounded-lg hover:bg-[#E5E5E5] transition-colors"
                >
                  {t('calendar.today')}
                </button>
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors"
                >
                  {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors"
                >
                  {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {(isRTL ? [...dayNames].reverse() : dayNames).map((day) => (
                <div key={day} className="text-center font-medium text-sm text-[#555555] py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}

              {/* Calendar days */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const dayEvents = getEventsForDay(day);
                const today = isToday(day);

                return (
                  <div
                    key={day}
                    className={`aspect-square border rounded-lg p-2 hover:bg-[#F7F7F7] transition-colors cursor-pointer ${
                      today ? 'border-[#B5752A] bg-[#FEF3E2]' : 'border-[#E5E5E5]'
                    }`}
                  >
                    <div className={`font-medium text-sm mb-1 ${today ? 'text-[#B5752A]' : 'text-[#16100A]'}`}>
                      {day}
                    </div>
                    {dayEvents.length > 0 && (
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className="w-full h-1 rounded gradient-primary"
                          />
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-[#555555]">+{dayEvents.length - 2}</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div>
          <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
            <h3 className={`font-bold text-[#16100A] mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('calendar.upcomingEvents')}
            </h3>

            <div className="space-y-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 border border-[#E5E5E5] rounded-lg hover:shadow-md transition-shadow"
                  >
                    {/* Event Type */}
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium border mb-2 ${getEventTypeColor(event.type)}`}>
                      {getEventTypeLabel(event.type)}
                    </span>

                    {/* Event Title */}
                    <h4 className={`font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {language === 'ar' ? event.titleAr : event.title}
                    </h4>

                    {/* Event Details */}
                    <div className="space-y-2 text-sm text-[#555555]">
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                        <span dir="ltr">{event.date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                      </div>
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span dir="ltr">{event.time}</span>
                      </div>
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <UserIcon className="w-4 h-4 flex-shrink-0" />
                        <span>{t('calendar.with')} {language === 'ar' ? event.clientAr : event.client}</span>
                      </div>
                      {event.location && (
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span>{language === 'ar' ? event.locationAr : event.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Assigned To */}
                    <div className={`mt-3 pt-3 border-t border-[#E5E5E5] ${isRTL ? 'text-right' : 'text-left'}`}>
                      <span className="text-xs text-[#555555]">
                        {t('leads.assignedTo')}: <span className="font-medium text-[#16100A]">{language === 'ar' ? event.assignedToAr : event.assignedTo}</span>
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`text-center py-8 text-[#555555] ${isRTL ? 'text-right' : 'text-left'}`}>
                  <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{t('calendar.noEvents')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
