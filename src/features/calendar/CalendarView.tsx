import React, { useState } from 'react';
import { Plus, Calendar, Clock, User as UserIcon, MapPin, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../store/useConfigStore';
import { EventModal } from './components/EventModal';
import { useEvents } from './hooks/useEvents';
import { useCreateEvent } from './hooks/useCreateEvent';
import { useUpdateEvent } from './hooks/useUpdateEvent';
import { useDeleteEvent } from './hooks/useDeleteEvent';
import { useToastStore } from '../../store/useToastStore';
import { useAuthStore } from '../../store/useAuthStore';


export default function CalendarView() {
  const [currentDate, setCurrentDate]       = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent]   = useState<any>(null);
  const [currentPage, setCurrentPage]       = useState(1);
  const [view, setView]                     = useState<'calendar' | 'list'>('calendar');

  const { t, i18n } = useTranslation(['calendar', 'common']);
  const { dir }     = useConfigStore();
  const isRTL       = dir === 'rtl';
  const language    = i18n.language;

  // ── API ────────────────────────────────────────────────────────────────────
  const { data: eventsData, isLoading } = useEvents(currentPage, 50);
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const { user } = useAuthStore();

  const eventList: any[] = Array.isArray(eventsData?.data)
    ? eventsData.data
    : Array.isArray(eventsData)
    ? eventsData
    : [];

  const pagination = eventsData?.pagination;
  const totalPages = pagination?.numberOfPages ?? 1;
  const { triggerToast } = useToastStore();

  // ── Helpers ────────────────────────────────────────────────────────────────
  const resolveString = (val: any, keys = ['fullName', 'name', 'title', 'unitCode']) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    for (const k of keys) { if (val[k]) return val[k]; }
    return '';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Meeting':
      case 'MEETING':          return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Follow-up':
      case 'FOLLOW_UP':        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Reminder':
      case 'REMINDER':         return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Viewing':
      case 'PROPERTY_VIEWING': return 'bg-green-50 text-green-700 border-green-200';
      default:                 return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getTypeDotColor = (type: string) => {
    switch (type) {
      case 'Meeting':
      case 'MEETING':          return 'bg-blue-500';
      case 'Follow-up':
      case 'FOLLOW_UP':        return 'bg-purple-500';
      case 'Reminder':
      case 'REMINDER':         return 'bg-orange-500';
      case 'Viewing':
      case 'PROPERTY_VIEWING': return 'bg-green-500';
      default:                 return 'bg-gray-400';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'PROPERTY_VIEWING': return language === 'ar' ? 'زيارة عقار' : 'Property Viewing';
      case 'FOLLOW_UP':        return language === 'ar' ? 'متابعة' : 'Follow-up';
      case 'REMINDER':         return language === 'ar' ? 'تذكير' : 'Reminder';
      case 'MEETING':
      case 'Meeting':          return language === 'ar' ? 'اجتماع' : 'Meeting';
      default:                 return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
      case 'SCHEDULED':  return 'bg-[#FEF3E2] text-[#E0A626] border-[#E0A626]';
      case 'Completed':
      case 'COMPLETED':  return 'bg-green-50 text-green-700 border-green-200';
      case 'Cancelled':
      case 'CANCELLED':  return 'bg-red-50 text-red-700 border-red-200';
      default:           return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // ── Calendar Grid Helpers ──────────────────────────────────────────────────
  const getDaysInMonth = (date: Date) => {
    const year  = date.getFullYear();
    const month = date.getMonth();
    return {
      daysInMonth:      new Date(year, month + 1, 0).getDate(),
      startingDayOfWeek: new Date(year, month, 1).getDay(),
    };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();
  };

  const getEventsForDay = (day: number) => {
    return eventList.filter((event: any) => {
      const d = new Date(event.date);
      return d.getDate() === day &&
        d.getMonth() === currentDate.getMonth() &&
        d.getFullYear() === currentDate.getFullYear();
    });
  };

  const dayNames = language === 'ar'
    ? ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSaveEvent = (data: any) => {
  if (selectedEvent) {
    updateEvent.mutate(
      { id: selectedEvent._id || selectedEvent.id, data },
      {
        onSuccess: () => {
          triggerToast(language === 'ar' ? 'تم التحديث ✅' : 'Updated successfully ✅', 'success');
          setShowEventModal(false);
          setSelectedEvent(null);
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message;
          triggerToast(Array.isArray(msg) ? msg[0] : msg || 'حدث خطأ', 'error');
        },
      }
    );
  } else {
    createEvent.mutate(data, {
      onSuccess: () => {
        triggerToast(language === 'ar' ? 'تمت الإضافة 🚀' : 'Event created 🚀', 'success');
        setShowEventModal(false);
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message;
        triggerToast(Array.isArray(msg) ? msg[0] : msg || 'حدث خطأ', 'error');
      },
    });
  }
};

  // ── أضف الـ state ──
const [deleteConfig, setDeleteConfig] = useState<{ isOpen: boolean; id: string; title: string }>({
  isOpen: false, id: '', title: ''
});

// ── غير الـ handleDeleteEvent ──
const handleDeleteEvent = (id: string, title: string) => {
  setDeleteConfig({ isOpen: true, id, title });
};

const confirmDelete = () => {
  deleteEvent.mutate(deleteConfig.id, {
    onSuccess: () => {
      triggerToast(language === 'ar' ? 'تم الحذف ✅' : 'Deleted successfully ✅', 'success');
      setDeleteConfig({ isOpen: false, id: '', title: '' });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      triggerToast(Array.isArray(msg) ? msg[0] : msg || 'حدث خطأ', 'error');
      setDeleteConfig({ isOpen: false, id: '', title: '' });
    },
  });
};

  // ── Stats ──────────────────────────────────────────────────────────────────
  const today        = new Date().toISOString().split('T')[0];
  const upcomingEvents = eventList
    .filter((e: any) => (e.date?.split('T')[0] || e.date) >= today && e.status !== 'Completed' && e.status !== 'COMPLETED')
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const scheduledCount = eventList.filter((e: any) => e.status === 'Scheduled' || e.status === 'SCHEDULED').length;
  const completedCount = eventList.filter((e: any) => e.status === 'Completed' || e.status === 'COMPLETED').length;

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B5752A]" />
      </div>
    );
  }

  return (
    <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Header */}
      <div className="mb-6">
        <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h1 className="text-2xl font-bold text-[#16100A] mb-2">{t('calendar.eventsSchedule')}</h1>
            <p className="text-[#555555]">{t('calendar.manageSchedule')}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-[#F7F7F7] rounded-lg p-1 border border-[#E5E5E5]">
              <button
                onClick={() => setView('calendar')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === 'calendar' ? 'bg-white text-[#16100A] shadow-sm' : 'text-[#555555] hover:text-[#16100A]'
                }`}
              >
                {language === 'ar' ? 'كالندر' : 'Calendar'}
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === 'list' ? 'bg-white text-[#16100A] shadow-sm' : 'text-[#555555] hover:text-[#16100A]'
                }`}
              >
                {language === 'ar' ? 'قائمة' : 'List'}
              </button>
            </div>
            <button
              className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors"
              onClick={() => { setSelectedEvent(null); setShowEventModal(true); }}
            >
              <Plus className="w-5 h-5" />
              {t('calendar.addEvent')}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Main Area ─────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {view === 'calendar' ? (
            /* ── Calendar Grid View ── */
            <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">

              {/* Month Nav */}
              <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h2 className="font-bold text-xl text-[#16100A]">
                  {currentDate.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                    className="p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors"
                  >
                    {isRTL ? <ChevronRight className="w-5 h-5 text-[#555555]" /> : <ChevronLeft className="w-5 h-5 text-[#555555]" />}
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-4 py-2 text-sm font-medium text-[#555555] bg-[#F7F7F7] hover:bg-[#E5E5E5] rounded-lg transition-colors"
                  >
                    {language === 'ar' ? 'اليوم' : 'Today'}
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                    className="p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors"
                  >
                    {isRTL ? <ChevronLeft className="w-5 h-5 text-[#555555]" /> : <ChevronRight className="w-5 h-5 text-[#555555]" />}
                  </button>
                </div>
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center font-medium text-sm text-[#555555] py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day       = i + 1;
                  const dayEvents = getEventsForDay(day);
                  const todayDay  = isToday(day);

                  return (
                    <div
                      key={day}
                      className={`min-h-[80px] border rounded-xl p-2 transition-colors cursor-pointer hover:bg-[#FAFAFA] ${
                        todayDay ? 'border-[#B5752A] bg-[#FEF3E2]' : 'border-[#E5E5E5]'
                      }`}
                    >
                      <div className={`font-medium text-sm mb-1 ${todayDay ? 'text-[#B5752A]' : 'text-[#16100A]'}`}>
                        {day}
                      </div>
                      {dayEvents.length > 0 && (
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event: any) => (
                            <div
                              key={event._id || event.id}
                              className={`w-full h-1.5 rounded-full ${getTypeDotColor(event.type)}`}
                            />
                          ))}
                          {dayEvents.length > 2 && (
                            <p className="text-xs text-[#555555]">+{dayEvents.length - 2}</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className={`flex flex-wrap gap-4 mt-4 pt-4 border-t border-[#E5E5E5] ${isRTL ? 'flex-row-reverse' : ''}`}>
                {[
                  { color: 'bg-green-500',  label: language === 'ar' ? 'زيارة عقار' : 'Property Viewing' },
                  { color: 'bg-purple-500', label: language === 'ar' ? 'متابعة' : 'Follow-up' },
                  { color: 'bg-orange-500', label: language === 'ar' ? 'تذكير' : 'Reminder' },
                  { color: 'bg-blue-500',   label: language === 'ar' ? 'اجتماع' : 'Meeting' },
                ].map(({ color, label }) => (
                  <div key={label} className={`flex items-center gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                    <span className="text-xs text-[#555555]">{label}</span>
                  </div>
                ))}
              </div>
            </div>

          ) : (
            /* ── List View ── */
            <div className="space-y-4">

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-[#E5E5E5] p-4 text-center">
                  <p className="text-2xl font-bold text-[#16100A] mb-1">{scheduledCount}</p>
                  <p className="text-xs text-[#555555]">{language === 'ar' ? 'مجدول' : 'Scheduled'}</p>
                </div>
                <div className="bg-white rounded-lg border border-[#E5E5E5] p-4 text-center">
                  <p className="text-2xl font-bold text-green-600 mb-1">{completedCount}</p>
                  <p className="text-xs text-[#555555]">{language === 'ar' ? 'مكتمل' : 'Completed'}</p>
                </div>
                <div className="bg-white rounded-lg border border-[#E5E5E5] p-4 text-center">
                  <p className="text-2xl font-bold text-[#E0A626] mb-1">{upcomingEvents.length}</p>
                  <p className="text-xs text-[#555555]">{language === 'ar' ? 'قادم' : 'Upcoming'}</p>
                </div>
              </div>

              <h3 className={`font-bold text-[#16100A] ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'جميع الأحداث' : 'All Events'}
              </h3>

              {eventList.length === 0 ? (
                <div className="bg-white rounded-lg border border-[#E5E5E5] p-16 text-center text-[#AAAAAA]">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>{language === 'ar' ? 'لا توجد أحداث' : 'No events found'}</p>
                </div>
              ) : (
                Object.entries(
                  eventList.reduce((acc: any, event: any) => {
                    const key = event.date?.split('T')[0] || event.date;
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(event);
                    return acc;
                  }, {})
                )
                  .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                  .map(([date, events]: [string, any[]]) => (
                    <div key={date} className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden">
                      <div className="bg-[#F7F7F7] px-6 py-3 border-b border-[#E5E5E5]">
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Calendar className="w-4 h-4 text-[#555555]" />
                          <span className="font-medium text-[#16100A]">
                            {new Date(date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="divide-y divide-[#E5E5E5]">
                        {events.map((event: any) => (
                          <div key={event._id || event.id} className="p-6 hover:bg-[#FAFAFA] transition-colors">
                            <div className={`flex items-start justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <div className="flex-1">
                                <div className={`flex items-center gap-2 mb-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                                  <h4 className="font-bold text-[#16100A]">{event.title}</h4>
                                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getTypeColor(event.type)}`}>
                                    {getTypeLabel(event.type)}
                                  </span>
                                </div>
                                <div className={`flex items-center gap-4 text-sm text-[#555555] flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                                  <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <Clock className="w-4 h-4" />
                                    <span dir="ltr">{event.time}</span>
                                  </div>
                                  {event.location && (
                                    <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                      <MapPin className="w-4 h-4" />
                                      <span>{resolveString(event.location)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                {/* <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(event.status)}`}>
                                  {event.status}
                                </span> */}
                                <button
                                  onClick={() => { setSelectedEvent(event); setShowEventModal(true); }}
                                  className="p-1.5 hover:bg-[#F7F7F7] rounded-lg transition-colors"
                                >
                                  ✏️
                                </button>
                                <button
                                 // ✅ تمرير الـ id والـ title معاً
onClick={() => handleDeleteEvent(event._id || event.id, event.title)}
                                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                              </div>
                            </div>
                            <div className={`space-y-1 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                              {event.client && (
                                <div className={`flex items-center gap-2 text-[#555555] ${isRTL ? 'flex-row-reverse' : ''}`}>
                                  <UserIcon className="w-4 h-4 flex-shrink-0" />
                                  <span>
                                    {language === 'ar' ? 'العميل:' : 'Client:'}{' '}
                                    <span className="font-medium text-[#16100A]">{resolveString(event.client, ['fullName', 'name'])}</span>
                                  </span>
                                </div>
                              )}
                              {event.assignedTo && (
                                <p className="text-[#555555] ps-6">
                                  {language === 'ar' ? 'المسؤول:' : 'Assigned to:'}{' '}
                                  <span className="font-medium text-[#16100A]">{resolveString(event.assignedTo, ['fullName', 'name'])}</span>
                                </p>
                              )}
                              {event.notes && (
                                <p className="mt-2 pt-2 border-t border-[#E5E5E5] text-[#555555] text-xs">
                                  {language === 'ar' ? 'ملاحظات:' : 'Notes:'} {event.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={`flex items-center justify-center gap-2 mt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E5E5] hover:bg-[#F7F7F7] disabled:opacity-40 transition-colors"
                  >
                    {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        page === currentPage
                          ? 'gradient-primary text-white shadow-sm'
                          : 'border border-[#E5E5E5] text-[#555555] hover:bg-[#F7F7F7]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E5E5] hover:bg-[#F7F7F7] disabled:opacity-40 transition-colors"
                  >
                    {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Sidebar ───────────────────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Upcoming Events */}
          <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
            <h3 className={`font-bold text-[#16100A] mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              {language === 'ar' ? 'الأحداث القادمة' : 'Upcoming Events'}
            </h3>
            <div className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8 text-[#AAAAAA]">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">{language === 'ar' ? 'لا توجد أحداث قادمة' : 'No upcoming events'}</p>
                </div>
              ) : (
                upcomingEvents.map((event: any) => (
                  <div key={event._id || event.id} className="pb-4 border-b border-[#E5E5E5] last:border-0 last:pb-0">
                    <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="flex-shrink-0 w-12 h-12 gradient-primary rounded-lg flex flex-col items-center justify-center text-white">
                        <span className="text-xs font-medium">
                          {new Date(event.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'short' })}
                        </span>
                        <span className="text-lg font-bold leading-none">{new Date(event.date).getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium text-[#16100A] text-sm mb-1 truncate ${isRTL ? 'text-right' : 'text-left'}`}>
                          {event.title}
                        </h4>
                        <p className="text-xs text-[#555555] mb-2" dir="ltr">{event.time}</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getTypeColor(event.type)}`}>
                          {getTypeLabel(event.type)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Event Types Legend */}
          <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
            <h3 className={`font-bold text-[#16100A] mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              {language === 'ar' ? 'أنواع الأحداث' : 'Event Types'}
            </h3>
            <div className="space-y-3">
              {[
                { color: 'bg-green-500',  label: language === 'ar' ? 'زيارة عقار' : 'Property Viewing' },
                { color: 'bg-purple-500', label: language === 'ar' ? 'متابعة' : 'Follow-up' },
                { color: 'bg-orange-500', label: language === 'ar' ? 'تذكير' : 'Reminder' },
                { color: 'bg-blue-500',   label: language === 'ar' ? 'اجتماع' : 'Meeting' },
              ].map(({ color, label }) => (
                <div key={label} className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`w-3 h-3 rounded-full flex-shrink-0 ${color}`} />
                  <span className="text-sm text-[#555555]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
{deleteConfig.isOpen && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
        <Trash2 className="w-6 h-6 text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-[#16100A] text-center mb-2">
        {language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
      </h3>
      <p className="text-[#555555] text-center text-sm mb-6">
        {language === 'ar'
          ? `هل أنت متأكد من حذف "${deleteConfig.title}"؟ لا يمكن التراجع عن هذا الإجراء.`
          : `Are you sure you want to delete "${deleteConfig.title}"? This action cannot be undone.`}
      </p>
      <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <button
          onClick={confirmDelete}
          disabled={deleteEvent.isPending}
          className="flex-1 bg-red-500 text-white py-2.5 rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50"
        >
          {deleteEvent.isPending ? '...' : (language === 'ar' ? 'حذف' : 'Delete')}
        </button>
        <button
          onClick={() => setDeleteConfig({ isOpen: false, id: '', title: '' })}
          className="flex-1 bg-[#F7F7F7] text-[#555555] py-2.5 rounded-lg hover:bg-[#E5E5E5] transition-colors font-medium"
        >
          {language === 'ar' ? 'إلغاء' : 'Cancel'}
        </button>
      </div>
    </div>
  </div>
)}

      {/* Event Modal */}
      <EventModal
        show={showEventModal}
        onClose={() => { setShowEventModal(false); setSelectedEvent(null); }}
        onSave={handleSaveEvent}
        event={selectedEvent}
      />
    </div>
  );
}