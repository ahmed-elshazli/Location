import React, { useState } from 'react';
import { 
  ArrowLeft, MapPin, Maximize2, Bed, Bath, Calendar, Building2, 
  User, Phone, Mail, Share2, Printer, ChevronLeft, ChevronRight, 
  X, Copy, Check, Tag, Hash, Layers, Home
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../store/useConfigStore';

export interface Property {
  id: string;
  unitCode: string;
  type: string;
  purpose: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  price: number;
  status: 'available' | 'sold' | 'reserved';
  project: string;
  developer: string;
  floor?: string;
  apartmentNumber?: string;
  zone?: string;
  villaZone?: string;
  phase?: string;
  constructionStatus?: string;
  images?: string[];
}

interface PropertyDetailsProps {
  property: Property;
  onBack: () => void;
}

export default function PropertyDetails({ property, onBack }: PropertyDetailsProps) {
  const { t, i18n } = useTranslation('properties');
  const { dir } = useConfigStore();
  const isRTL = dir === 'rtl';
  const language = i18n.language;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const defaultImages = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
  ];

  const images = property.images && property.images.length > 0 ? property.images : defaultImages;

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

  const propertyUrl = `${window.location.origin}/property/${property.id}`;
  const propertyTitle = `${property.unitCode} - ${property.type} in ${property.area}`;
  const propertyDescription = `${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms, ${property.size} sqm - EGP ${formatPrice(property.price)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(propertyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${propertyTitle}\n${propertyDescription}\n${propertyUrl}`)}`, '_blank');
  };

  const handleEmailShare = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(propertyTitle)}&body=${encodeURIComponent(`${propertyDescription}\n\nView property: ${propertyUrl}`)}`;
  };

  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}`, '_blank');
  };

  // كل الـ specs من الـ API
  const specifications = [
    { label: t('properties.unitCode'),   value: property.unitCode,           icon: <Hash className="w-4 h-4 text-[#B5752A]" /> },
    { label: t('properties.type'),       value: property.type ? t(`properties.${property.type.toLowerCase()}`) : '---', icon: <Home className="w-4 h-4 text-[#B5752A]" /> },
    { label: t('properties.purpose'),    value: property.purpose ? t(`properties.${property.purpose.toLowerCase()}`) : '---', icon: <Tag className="w-4 h-4 text-[#B5752A]" /> },
    { label: t('properties.area'),       value: property.area,               icon: <MapPin className="w-4 h-4 text-[#B5752A]" /> },
    { label: t('properties.size'),       value: `${property.size} ${t('properties.sqm')}`, icon: <Maximize2 className="w-4 h-4 text-[#B5752A]" /> },
    { label: t('properties.status'),     value: property.status ? t(`properties.${property.status.toLowerCase()}`) : '---', icon: <Layers className="w-4 h-4 text-[#B5752A]" /> },
    property.floor         && { label: t('properties.floor'),            value: property.floor,           icon: <Building2 className="w-4 h-4 text-[#B5752A]" /> },
    property.apartmentNumber && { label: t('properties.apartmentNumber'), value: property.apartmentNumber, icon: <Hash className="w-4 h-4 text-[#B5752A]" /> },
    (property.zone || property.villaZone) && { label: t('properties.villaZone'), value: property.zone || property.villaZone, icon: <MapPin className="w-4 h-4 text-[#B5752A]" /> },
    property.phase         && { label: t('properties.phase'),            value: property.phase,           icon: <Layers className="w-4 h-4 text-[#B5752A]" /> },
    property.constructionStatus && { label: t('properties.constructionStatus'), value: property.constructionStatus, icon: <Building2 className="w-4 h-4 text-[#B5752A]" /> },
    property.developer     && { label: t('properties.developer'),        value: property.developer,       icon: <Building2 className="w-4 h-4 text-[#B5752A]" /> },
    property.project       && { label: t('properties.project', 'Project'), value: property.project,      icon: <Building2 className="w-4 h-4 text-[#B5752A]" /> },
  ].filter(Boolean) as { label: string; value: string; icon: React.ReactNode }[];

  return (
    <div className="h-full overflow-y-auto bg-[#FAFAFA]" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E5] sticky top-0 z-10">
        <div className="p-6">
          <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={onBack}
              className={`flex items-center gap-2 text-[#555555] hover:text-[#B5752A] transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
            >
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
                <span>{property.project} {property.area && `- ${property.area}`}</span>
              </div>
              {getStatusBadge()}
            </div>
            <div className={isRTL ? 'text-left' : 'text-right'}>
              <p className="text-sm text-[#555555] mb-1">{t('properties.fullPrice')}</p>
              <p className="text-3xl font-bold gradient-text">
                {formatPrice(property.price)} {t('properties.egp')}
              </p>
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
            <img
              src={images[currentImageIndex]}
              alt={property.unitCode}
              className="w-full h-full object-contain"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(p => (p - 1 + images.length) % images.length)}
                  className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} bg-white/80 hover:bg-white p-3 rounded-full shadow-lg`}
                >
                  {isRTL ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
                </button>
                <button
                  onClick={() => setCurrentImageIndex(p => (p + 1) % images.length)}
                  className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-4' : 'right-4'} bg-white/80 hover:bg-white p-3 rounded-full shadow-lg`}
                >
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
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex ? 'border-[#B5752A] ring-2 ring-[#B5752A]/20' : 'border-[#E5E5E5] hover:border-[#B5752A]/50'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Overview Cards */}
            <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
              <h2 className={`text-xl font-bold text-[#16100A] mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('properties.overview')}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-[#FAFAFA] rounded-lg">
                  <Bed className="w-8 h-8 text-[#B5752A] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-[#16100A]">{property.bedrooms || 0}</p>
                  <p className="text-sm text-[#555555]">{t('properties.bedrooms')}</p>
                </div>
                <div className="text-center p-4 bg-[#FAFAFA] rounded-lg">
                  <Bath className="w-8 h-8 text-[#B5752A] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-[#16100A]">{property.bathrooms || 0}</p>
                  <p className="text-sm text-[#555555]">{t('properties.bathrooms')}</p>
                </div>
                <div className="text-center p-4 bg-[#FAFAFA] rounded-lg">
                  <Maximize2 className="w-8 h-8 text-[#B5752A] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-[#16100A]">{property.size}</p>
                  <p className="text-sm text-[#555555]">{t('properties.sqm')}</p>
                </div>
                <div className="text-center p-4 bg-[#FAFAFA] rounded-lg">
                  <Building2 className="w-8 h-8 text-[#B5752A] mx-auto mb-2" />
                  <p className="text-lg font-bold text-[#16100A] capitalize">{property.type}</p>
                  <p className="text-sm text-[#555555]">{t('properties.type')}</p>
                </div>
              </div>
            </div>

            {/* Specifications - كل الداتا من الـ API */}
            <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
              <h2 className={`text-xl font-bold text-[#16100A] mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('properties.specifications')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {specifications.map((spec, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 bg-[#FAFAFA] rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`flex items-center gap-2 text-[#555555] ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {spec.icon}
                      <span className="text-sm">{spec.label}</span>
                    </div>
                    <span className="font-semibold text-[#16100A] text-sm capitalize">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Project & Developer */}
            <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
              <h3 className={`font-semibold text-[#16100A] mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('properties.developer')}
              </h3>
              <div className={`space-y-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                {property.developer && (
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Building2 className="w-5 h-5 text-[#B5752A] flex-shrink-0" />
                    <span className="text-[#16100A] font-medium">{property.developer}</span>
                  </div>
                )}
                {property.project && (
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <MapPin className="w-5 h-5 text-[#555555] flex-shrink-0" />
                    <span className="text-sm text-[#555555]">{property.project}</span>
                  </div>
                )}
                {property.area && (
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <MapPin className="w-5 h-5 text-[#555555] flex-shrink-0" />
                    <span className="text-sm text-[#555555]">{property.area}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Agent */}
            <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
              <h3 className={`font-semibold text-[#16100A] mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('properties.contactAgent')}
              </h3>
              <div className={`space-y-3 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <User className="w-5 h-5 text-[#B5752A]" />
                  <span className="text-[#16100A]">Ahmed Hassan</span>
                </div>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Phone className="w-5 h-5 text-[#555555]" />
                  <span className="text-sm text-[#555555]" dir="ltr">+20 100 123 4567</span>
                </div>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Mail className="w-5 h-5 text-[#555555]" />
                  <span className="text-sm text-[#555555]" dir="ltr">ahmed@location.com</span>
                </div>
              </div>
              <button className="w-full gradient-primary text-white py-3 rounded-lg hover:opacity-90 transition-all font-medium shadow-lg">
                {t('properties.scheduleViewing')}
              </button>
            </div>

            {/* Delivery Info */}
            <div className="bg-gradient-to-br from-[#FEF3E2] to-[#FCF8E8] rounded-lg border border-[#B5752A]/20 p-6">
              <div className={`flex items-center gap-3 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Calendar className="w-6 h-6 text-[#B5752A]" />
                <h3 className="font-semibold text-[#16100A]">{t('properties.deliveryDate')}</h3>
              </div>
              <p className="text-2xl font-bold text-[#B5752A]">Q2 2026</p>
              <p className="text-sm text-[#555555] mt-2">
                {property.constructionStatus || t('properties.ready')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4" onClick={e => e.stopPropagation()} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className={`flex items-center justify-between p-6 border-b border-[#E5E5E5] ${isRTL ? 'flex-row-reverse' : ''}`}>
              <h3 className="text-xl font-bold text-[#16100A]">{t('properties.shareProperty')}</h3>
              <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-[#F7F7F7] rounded-full">
                <X className="w-5 h-5 text-[#555555]" />
              </button>
            </div>
            <div className="p-6 space-y-3">

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all ${copied ? 'bg-green-50 border-green-200' : 'bg-white border-[#E5E5E5] hover:bg-[#F7F7F7]'} ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
              >
                {copied ? <Check className="w-6 h-6 text-green-600 flex-shrink-0" /> : <Copy className="w-6 h-6 text-[#B5752A] flex-shrink-0" />}
                <div className="flex-1">
                  <p className={`font-semibold ${copied ? 'text-green-700' : 'text-[#16100A]'}`}>
                    {copied ? (language === 'ar' ? 'تم النسخ!' : 'Copied!') : t('properties.copyLink')}
                  </p>
                  {!copied && <p className="text-sm text-[#555555] truncate" dir="ltr">{propertyUrl}</p>}
                </div>
              </button>

              {/* WhatsApp */}
              <button
                onClick={handleWhatsAppShare}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border border-[#E5E5E5] bg-white hover:bg-[#F7F7F7] transition-colors ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
              >
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#16100A]">{t('properties.whatsapp')}</p>
                  <p className="text-sm text-[#555555]">{language === 'ar' ? 'شارك عبر واتساب' : 'Share via WhatsApp'}</p>
                </div>
              </button>

              {/* Email */}
              <button
                onClick={handleEmailShare}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border border-[#E5E5E5] bg-white hover:bg-[#F7F7F7] transition-colors ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
              >
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#16100A]">{t('properties.email')}</p>
                  <p className="text-sm text-[#555555]">{language === 'ar' ? 'شارك عبر البريد الإلكتروني' : 'Share via email'}</p>
                </div>
              </button>

              {/* Facebook */}
              <button
                onClick={handleFacebookShare}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border border-[#E5E5E5] bg-white hover:bg-[#F7F7F7] transition-colors ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}
              >
                <div className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#16100A]">{t('properties.facebook')}</p>
                  <p className="text-sm text-[#555555]">{language === 'ar' ? 'شارك على فيسبوك' : 'Share on Facebook'}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}