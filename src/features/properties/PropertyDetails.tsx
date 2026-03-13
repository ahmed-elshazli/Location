import React, { useState } from 'react';
import { 
  ArrowLeft, MapPin, Maximize2, Bed, Bath, Calendar, Building2, 
  User, Phone, Mail, Share2, Printer, ChevronLeft, ChevronRight, 
  X, Copy, Check, Tag, Hash, Layers, Home, Clock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../store/useConfigStore';
import { useNavigate, useParams } from 'react-router';
import { useUnitById } from './hooks/useUnitById';
import { useCreateEvent } from '../calendar/hooks/useCreateEvent';
import { useAllClients } from '../clients/hooks/useAllClients';
import { useUsers } from '../users/hooks/useUsers';
import { useToastStore } from '../../store/useToastStore';

const toStr = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') return val.name || val.title || val._id || '';
  return '';
};

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('properties');
  const { dir } = useConfigStore();
  const { triggerToast } = useToastStore();
  const isRTL = dir === 'rtl';
  const language = i18n.language;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showViewingModal, setShowViewingModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewingSubmitted, setViewingSubmitted] = useState(false);

  const [viewingForm, setViewingForm] = useState({
    title:      '',
    type:       'PROPERTY_VIEWING',
    date:       '',
    time:       '',
    location:   '',
    client:     '',
    assignedTo: '',
    notes:      '',
  });

  const { data: propertyData, isLoading } = useUnitById(id);
  const createEvent = useCreateEvent();

  const { data: clientsData } = useAllClients();
  const { data: usersData }   = useUsers();

  const clients = Array.isArray(clientsData?.data) ? clientsData.data
    : Array.isArray(clientsData) ? clientsData : [];

  const users = Array.isArray(usersData?.data) ? usersData.data
    : Array.isArray(usersData) ? usersData : [];

  const defaultImages = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
  ];

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B5752A]" />
      </div>
    );
  }

  const property = propertyData?.data || propertyData;

  if (!property) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-[#555555]">{language === 'ar' ? 'لم يتم العثور على العقار' : 'Property not found'}</p>
      </div>
    );
  }

  const projectName   = toStr(property.project);
  const developerName = toStr(property.developer);
  const images = property.images?.length > 0 ? property.images : defaultImages;

  const getStatusBadge = () => {
    const statusConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
      available: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: t('properties.available') },
      sold:      { bg: 'bg-gray-50',  text: 'text-gray-700',  border: 'border-gray-200',  label: t('properties.sold') },
      reserved:  { bg: 'bg-orange-50',text: 'text-orange-700',border: 'border-orange-200',label: t('properties.reserved') },
    };
    const config = statusConfig[property.status?.toLowerCase()] || statusConfig.available;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.bg} ${config.text} ${config.border}`}>
        {config.label}
      </span>
    );
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US').format(price);

  const propertyUrl = `${window.location.origin}/properties/${property._id || property.id}`;
  const propertyTitle = `${property.unitCode} - ${property.type} in ${toStr(property.area)}`;
  const propertyDescription = `${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms, ${property.size} sqm - EGP ${formatPrice(property.price)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(propertyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleWhatsAppShare  = () => window.open(`https://wa.me/?text=${encodeURIComponent(`${propertyTitle}\n${propertyDescription}\n${propertyUrl}`)}`, '_blank');
  const handleEmailShare     = () => { window.location.href = `mailto:?subject=${encodeURIComponent(propertyTitle)}&body=${encodeURIComponent(`${propertyDescription}\n\nView property: ${propertyUrl}`)}`; };
  const handleFacebookShare  = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}`, '_blank');

  const openViewingModal = () => {
    setViewingForm({
      title:      `${language === 'ar' ? 'معاينة عقار' : 'Property Viewing'} - ${property.unitCode}`,
      type:       'PROPERTY_VIEWING',
      date:       '',
      time:       '',
      location:   `${projectName}${property.area ? ` - ${toStr(property.area)}` : ''}`,
      client:     '',
      assignedTo: '',
      notes:      '',
    });
    setViewingSubmitted(false);
    setShowViewingModal(true);
  };

  const handleViewingSubmit = () => {
    if (!viewingForm.client) {
      triggerToast(language === 'ar' ? 'اختر عميل' : 'Please select a client', 'error');
      return;
    }
    if (!viewingForm.assignedTo) {
      triggerToast(language === 'ar' ? 'اختر موظف مسؤول' : 'Please select assigned user', 'error');
      return;
    }

    const payload: any = {
      title:      viewingForm.title,
      type:       viewingForm.type,
      date:       viewingForm.date,   // "YYYY-MM-DD"
      time:       viewingForm.time,   // "HH:MM"
      client:     viewingForm.client,
      assignedTo: viewingForm.assignedTo,
    };
    if (viewingForm.location) payload.location = viewingForm.location;
    if (viewingForm.notes)    payload.notes    = viewingForm.notes;
// console.log('submitting payload:', payload);
// console.log('createEvent state:', createEvent);
    createEvent.mutate(payload, {
      onSuccess: () => {
        setViewingSubmitted(true);
        setTimeout(() => {
          setShowViewingModal(false);
          setViewingSubmitted(false);
        }, 2000);
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message;
        triggerToast(Array.isArray(msg) ? msg[0] : msg || (language === 'ar' ? 'فشل الحجز' : 'Failed to schedule'), 'error');
      },
    });
  };

  const specifications = [
    { label: t('properties.unitCode'),   value: toStr(property.unitCode),     icon: <Hash className="w-4 h-4 text-[#B5752A]" /> },
    { label: t('properties.type'),       value: property.type ? t(`properties.${property.type.toLowerCase()}`) : '---', icon: <Home className="w-4 h-4 text-[#B5752A]" /> },
    { label: t('properties.purpose'),    value: property.purpose ? t(`properties.${property.purpose.toLowerCase()}`) : '---', icon: <Tag className="w-4 h-4 text-[#B5752A]" /> },
    { label: t('properties.area'),       value: toStr(property.area),          icon: <MapPin className="w-4 h-4 text-[#B5752A]" /> },
    { label: t('properties.size'),       value: `${property.size} ${t('properties.sqm')}`, icon: <Maximize2 className="w-4 h-4 text-[#B5752A]" /> },
    { label: t('properties.status'),     value: property.status ? t(`properties.${property.status.toLowerCase()}`) : '---', icon: <Layers className="w-4 h-4 text-[#B5752A]" /> },
    property.floor              && { label: t('properties.floor'),             value: toStr(property.floor),             icon: <Building2 className="w-4 h-4 text-[#B5752A]" /> },
    property.apartmentNumber    && { label: t('properties.apartmentNumber'),   value: toStr(property.apartmentNumber),   icon: <Hash className="w-4 h-4 text-[#B5752A]" /> },
    (property.zone||property.villaZone) && { label: t('properties.villaZone'), value: toStr(property.zone||property.villaZone), icon: <MapPin className="w-4 h-4 text-[#B5752A]" /> },
    property.phase              && { label: t('properties.phase'),             value: toStr(property.phase),             icon: <Layers className="w-4 h-4 text-[#B5752A]" /> },
    property.constructionStatus && { label: t('properties.constructionStatus'),value: toStr(property.constructionStatus),icon: <Building2 className="w-4 h-4 text-[#B5752A]" /> },
    developerName               && { label: t('properties.developer'),         value: developerName,                     icon: <Building2 className="w-4 h-4 text-[#B5752A]" /> },
    projectName                 && { label: t('properties.project','Project'), value: projectName,                       icon: <Building2 className="w-4 h-4 text-[#B5752A]" /> },
  ].filter(Boolean) as { label: string; value: string; icon: React.ReactNode }[];

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="h-full overflow-y-auto bg-[#FAFAFA]" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E5] sticky top-0 z-10">
        <div className="p-6">
          <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button onClick={() => navigate(-1)} className={`flex items-center gap-2 text-[#555555] hover:text-[#B5752A] transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
              {isRTL ? <ChevronRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
              <span className="font-medium">{t('properties.backToList')}</span>
            </button>
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button onClick={() => setShowShareModal(true)} className="p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors">
                <Share2 className="w-5 h-5 text-[#555555]" />
              </button>
              <button onClick={() => window.print()} className="p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors">
                <Printer className="w-5 h-5 text-[#555555]" />
              </button>
            </div>
          </div>
          <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <h1 className="text-3xl font-bold text-[#16100A] mb-2">{property.unitCode}</h1>
              <div className={`flex items-center gap-2 text-[#555555] mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <MapPin className="w-4 h-4" />
                <span>{projectName}{property.area && ` - ${toStr(property.area)}`}</span>
              </div>
              {getStatusBadge()}
            </div>
            <div className={isRTL ? 'text-left' : 'text-right'}>
              <p className="text-sm text-[#555555] mb-1">{t('properties.fullPrice')}</p>
              <p className="text-3xl font-bold gradient-text">{formatPrice(property.price)} {t('properties.egp')}</p>
              {property.size > 0 && (
                <p className="text-sm text-[#555555] mt-1">
                  {formatPrice(Math.round(property.price / property.size))} {t('properties.egp')}/{t('properties.sqm')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Image Gallery */}
        <div className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden mb-6">
          <div className="relative h-[400px] bg-black">
            <img src={images[currentImageIndex]} alt={property.unitCode} className="w-full h-full object-contain" />
            {images.length > 1 && (
              <>
                <button onClick={() => setCurrentImageIndex(p => (p - 1 + images.length) % images.length)} className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} bg-white/80 hover:bg-white p-3 rounded-full shadow-lg`}>
                  {isRTL ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
                </button>
                <button onClick={() => setCurrentImageIndex(p => (p + 1) % images.length)} className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-4' : 'right-4'} bg-white/80 hover:bg-white p-3 rounded-full shadow-lg`}>
                  {isRTL ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                </button>
              </>
            )}
            <div className={`absolute bottom-4 ${isRTL ? 'left-4' : 'right-4'} bg-black/50 text-white px-3 py-1 rounded-lg text-sm`}>
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
          {images.length > 1 && (
            <div className="p-4 bg-[#FAFAFA] border-t border-[#E5E5E5]">
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img: string, idx: number) => (
                  <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${idx === currentImageIndex ? 'border-[#B5752A] ring-2 ring-[#B5752A]/20' : 'border-[#E5E5E5] hover:border-[#B5752A]/50'}`}>
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
              <h2 className={`text-xl font-bold text-[#16100A] mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t('properties.overview')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: <Bed className="w-8 h-8 text-[#B5752A] mx-auto mb-2" />,      value: property.bedrooms || 0,  label: t('properties.bedrooms') },
                  { icon: <Bath className="w-8 h-8 text-[#B5752A] mx-auto mb-2" />,     value: property.bathrooms || 0, label: t('properties.bathrooms') },
                  { icon: <Maximize2 className="w-8 h-8 text-[#B5752A] mx-auto mb-2" />,value: property.size,           label: t('properties.sqm') },
                  { icon: <Building2 className="w-8 h-8 text-[#B5752A] mx-auto mb-2" />,value: property.type,           label: t('properties.type') },
                ].map((item, i) => (
                  <div key={i} className="text-center p-4 bg-[#FAFAFA] rounded-lg">
                    {item.icon}
                    <p className="text-2xl font-bold text-[#16100A] capitalize">{item.value}</p>
                    <p className="text-sm text-[#555555]">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
              <h2 className={`text-xl font-bold text-[#16100A] mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t('properties.specifications')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {specifications.map((spec, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-3 bg-[#FAFAFA] rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-2 text-[#555555] ${isRTL ? 'flex-row-reverse' : ''}`}>{spec.icon}<span className="text-sm">{spec.label}</span></div>
                    <span className="font-semibold text-[#16100A] text-sm capitalize">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
              <h3 className={`font-semibold text-[#16100A] mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t('properties.developer')}</h3>
              <div className={`space-y-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                {developerName && <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}><Building2 className="w-5 h-5 text-[#B5752A] flex-shrink-0" /><span className="text-[#16100A] font-medium">{developerName}</span></div>}
                {projectName   && <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}><MapPin className="w-5 h-5 text-[#555555] flex-shrink-0" /><span className="text-sm text-[#555555]">{projectName}</span></div>}
                {property.area && <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}><MapPin className="w-5 h-5 text-[#555555] flex-shrink-0" /><span className="text-sm text-[#555555]">{toStr(property.area)}</span></div>}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
              <h3 className={`font-semibold text-[#16100A] mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t('properties.contactAgent')}</h3>
              <div className={`space-y-3 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}><User className="w-5 h-5 text-[#B5752A]" /><span className="text-[#16100A]">Ahmed Hassan</span></div>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}><Phone className="w-5 h-5 text-[#555555]" /><span className="text-sm text-[#555555]" dir="ltr">+20 100 123 4567</span></div>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}><Mail className="w-5 h-5 text-[#555555]" /><span className="text-sm text-[#555555]" dir="ltr">ahmed@location.com</span></div>
              </div>
              <button onClick={openViewingModal} className="w-full gradient-primary text-white py-3 rounded-lg hover:opacity-90 transition-all font-medium shadow-lg">
                {t('properties.scheduleViewing')}
              </button>
            </div>

            <div className="bg-gradient-to-br from-[#FEF3E2] to-[#FCF8E8] rounded-lg border border-[#B5752A]/20 p-6">
              <div className={`flex items-center gap-3 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Calendar className="w-6 h-6 text-[#B5752A]" />
                <h3 className="font-semibold text-[#16100A]">{t('properties.deliveryDate')}</h3>
              </div>
              <p className="text-2xl font-bold text-[#B5752A]">Q2 2026</p>
              <p className="text-sm text-[#555555] mt-2">{toStr(property.constructionStatus) || t('properties.ready')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Schedule Viewing Modal ── */}
      {showViewingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowViewingModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className={`flex items-center justify-between p-6 border-b border-[#E5E5E5] sticky top-0 bg-white z-10 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h3 className="text-xl font-bold text-[#16100A]">{language === 'ar' ? 'حجز موعد معاينة' : 'Schedule a Viewing'}</h3>
                <p className="text-sm text-[#555555] mt-0.5">{property.unitCode} — {toStr(property.area)}</p>
              </div>
              <button onClick={() => setShowViewingModal(false)} className="p-2 hover:bg-[#F7F7F7] rounded-full transition-colors">
                <X className="w-5 h-5 text-[#555555]" />
              </button>
            </div>

            {viewingSubmitted ? (
              <div className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-lg font-bold text-[#16100A] mb-2">{language === 'ar' ? 'تم الحجز بنجاح! ✅' : 'Viewing Scheduled! ✅'}</h4>
                <p className="text-sm text-[#555555]">{language === 'ar' ? 'سيتواصل معك الوكيل لتأكيد الموعد' : 'The agent will contact you to confirm'}</p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <label className={`block text-sm font-medium text-[#16100A] mb-1.5 ${isRTL ? 'text-right' : 'text-left'}`}>{language === 'ar' ? 'عنوان الحدث *' : 'Event Title *'}</label>
                  <input type="text" required value={viewingForm.title}
                    onChange={e => setViewingForm({ ...viewingForm, title: e.target.value })}
                    className={`w-full px-4 py-2.5 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm ${isRTL ? 'text-right' : 'text-left'}`}
                  />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-sm font-medium text-[#16100A] mb-1.5 ${isRTL ? 'text-right' : 'text-left'}`}>{language === 'ar' ? 'التاريخ *' : 'Date *'}</label>
                    <div className="relative">
                      <Calendar className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAAAAA]`} />
                      <input type="date" min={today} required value={viewingForm.date}
                        onChange={e => setViewingForm({ ...viewingForm, date: e.target.value })}
                        className={`w-full ${isRTL ? 'pr-10 pl-2' : 'pl-10 pr-2'} py-2.5 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium text-[#16100A] mb-1.5 ${isRTL ? 'text-right' : 'text-left'}`}>{language === 'ar' ? 'الوقت *' : 'Time *'}</label>
                    <div className="relative">
                      <Clock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAAAAA]`} />
                      <input type="time" required value={viewingForm.time}
                        onChange={e => setViewingForm({ ...viewingForm, time: e.target.value })}
                        className={`w-full ${isRTL ? 'pr-10 pl-2' : 'pl-10 pr-2'} py-2.5 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm`}
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className={`block text-sm font-medium text-[#16100A] mb-1.5 ${isRTL ? 'text-right' : 'text-left'}`}>{language === 'ar' ? 'الموقع' : 'Location'}</label>
                  <div className="relative">
                    <MapPin className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAAAAA]`} />
                    <input type="text" value={viewingForm.location}
                      onChange={e => setViewingForm({ ...viewingForm, location: e.target.value })}
                      className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm`}
                    />
                  </div>
                </div>

                {/* Client */}
                <div>
                  <label className={`block text-sm font-medium text-[#16100A] mb-1.5 ${isRTL ? 'text-right' : 'text-left'}`}>{language === 'ar' ? 'العميل *' : 'Client *'}</label>
                  <div className="relative">
                    <User className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAAAAA]`} />
                    <select value={viewingForm.client}
                      onChange={e => setViewingForm({ ...viewingForm, client: e.target.value })}
                      className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm bg-white`}
                    >
                      <option value="">{language === 'ar' ? 'اختر عميل...' : 'Select client...'}</option>
                      {clients.map((c: any) => (
                        <option key={c._id || c.id} value={c._id || c.id}>{c.fullName || c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Assigned To */}
                <div>
                  <label className={`block text-sm font-medium text-[#16100A] mb-1.5 ${isRTL ? 'text-right' : 'text-left'}`}>{language === 'ar' ? 'المسؤول *' : 'Assigned To *'}</label>
                  <div className="relative">
                    <User className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAAAAA]`} />
                    <select value={viewingForm.assignedTo}
                      onChange={e => setViewingForm({ ...viewingForm, assignedTo: e.target.value })}
                      className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm bg-white`}
                    >
                      <option value="">{language === 'ar' ? 'اختر موظف...' : 'Select staff...'}</option>
                      {users.map((u: any) => (
                        <option key={u._id || u.id} value={u._id || u.id}>{u.fullName || u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className={`block text-sm font-medium text-[#16100A] mb-1.5 ${isRTL ? 'text-right' : 'text-left'}`}>{language === 'ar' ? 'ملاحظات (اختياري)' : 'Notes (optional)'}</label>
                  <textarea value={viewingForm.notes} rows={2}
                    onChange={e => setViewingForm({ ...viewingForm, notes: e.target.value })}
                    className={`w-full px-4 py-2.5 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] text-sm resize-none ${isRTL ? 'text-right' : 'text-left'}`}
                    placeholder={language === 'ar' ? 'أي تفاصيل إضافية...' : 'Any additional details...'}
                  />
                </div>

                {/* Buttons */}
                <div className={`flex gap-3 pt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <button onClick={() => setShowViewingModal(false)} className="flex-1 py-2.5 border border-[#E5E5E5] rounded-lg text-[#555555] hover:bg-[#F7F7F7] font-medium transition-colors text-sm">
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleViewingSubmit}
                    disabled={!viewingForm.title || !viewingForm.date || !viewingForm.time || !viewingForm.client || !viewingForm.assignedTo || createEvent.isPending}
                    className="flex-1 gradient-primary text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-40 text-sm"
                  >
                    {createEvent.isPending ? '...' : language === 'ar' ? 'تأكيد الحجز' : 'Confirm Booking'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Share Modal ── */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4" onClick={e => e.stopPropagation()} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className={`flex items-center justify-between p-6 border-b border-[#E5E5E5] ${isRTL ? 'flex-row-reverse' : ''}`}>
              <h3 className="text-xl font-bold text-[#16100A]">{t('properties.shareProperty')}</h3>
              <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-[#F7F7F7] rounded-full"><X className="w-5 h-5 text-[#555555]" /></button>
            </div>
            <div className="p-6 space-y-3">
              <button onClick={handleCopyLink} className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all ${copied ? 'bg-green-50 border-green-200' : 'bg-white border-[#E5E5E5] hover:bg-[#F7F7F7]'} ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                {copied ? <Check className="w-6 h-6 text-green-600 flex-shrink-0" /> : <Copy className="w-6 h-6 text-[#B5752A] flex-shrink-0" />}
                <div className="flex-1">
                  <p className={`font-semibold ${copied ? 'text-green-700' : 'text-[#16100A]'}`}>{copied ? (language === 'ar' ? 'تم النسخ!' : 'Copied!') : t('properties.copyLink')}</p>
                  {!copied && <p className="text-sm text-[#555555] truncate" dir="ltr">{propertyUrl}</p>}
                </div>
              </button>
              <button onClick={handleWhatsAppShare} className={`w-full flex items-center gap-4 p-4 rounded-lg border border-[#E5E5E5] bg-white hover:bg-[#F7F7F7] transition-colors ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                </div>
                <div className="flex-1"><p className="font-semibold text-[#16100A]">{t('properties.whatsapp')}</p><p className="text-sm text-[#555555]">{language === 'ar' ? 'شارك عبر واتساب' : 'Share via WhatsApp'}</p></div>
              </button>
              <button onClick={handleEmailShare} className={`w-full flex items-center gap-4 p-4 rounded-lg border border-[#E5E5E5] bg-white hover:bg-[#F7F7F7] transition-colors ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0"><Mail className="w-6 h-6 text-white" /></div>
                <div className="flex-1"><p className="font-semibold text-[#16100A]">{t('properties.email')}</p><p className="text-sm text-[#555555]">{language === 'ar' ? 'شارك عبر البريد الإلكتروني' : 'Share via email'}</p></div>
              </button>
              <button onClick={handleFacebookShare} className={`w-full flex items-center gap-4 p-4 rounded-lg border border-[#E5E5E5] bg-white hover:bg-[#F7F7F7] transition-colors ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                <div className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </div>
                <div className="flex-1"><p className="font-semibold text-[#16100A]">{t('properties.facebook')}</p><p className="text-sm text-[#555555]">{language === 'ar' ? 'شارك على فيسبوك' : 'Share on Facebook'}</p></div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}