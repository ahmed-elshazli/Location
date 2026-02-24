import React, { useState } from 'react';
import { Plus, Search, MapPin, Building2, Home, Edit2 } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // ✅ البديل الصحيح
import { useConfigStore } from '../../store/useConfigStore'; // ✅ لجلب الاتجاه
import { useAuthStore } from '../../store/useAuthStore'; // ✅ لجلب بيانات المستخدم

// ... (واجهة Area ومصفوفة mockAreas تبقى كما هي تماماً)

interface Area {
  id: string;
  name: string;
  nameAr: string;
  city: string;
  cityAr: string;
  zone?: string;
  group?: string;
  groupAr?: string;
  type: 'Villa Zone' | 'Apartment Zone' | 'Service Area' | 'Mixed';
  units: number;
  availableUnits: number;
  description: string;
  descriptionAr: string;
}

const mockAreas: Area[] = [
  // Madinaty Villa Zones
  { id: '1', name: 'B1', nameAr: 'ب1', city: 'Madinaty', cityAr: 'مدينتي', zone: 'B1', group: 'Villa Zones', groupAr: 'مناطق الفلل', type: 'Villa Zone', units: 125, availableUnits: 34, description: 'Premium villa zone with large plots', descriptionAr: 'منطقة فلل فاخرة بقطع أراضي كبيرة' },
  { id: '2', name: 'B2', nameAr: 'ب2', city: 'Madinaty', cityAr: 'مدينتي', zone: 'B2', group: 'Villa Zones', groupAr: 'مناطق الفلل', type: 'Villa Zone', units: 118, availableUnits: 28, description: 'Family-oriented villa community', descriptionAr: 'مجتمع فلل موجه للعائلات' },
  { id: '3', name: 'B3', nameAr: 'ب3', city: 'Madinaty', cityAr: 'مدينتي', zone: 'B3', group: 'Villa Zones', groupAr: 'مناطق الفلل', type: 'Villa Zone', units: 132, availableUnits: 41, description: 'Luxury villas with modern design', descriptionAr: 'فلل فاخرة بتصميم عصري' },
  { id: '4', name: 'B6', nameAr: 'ب6', city: 'Madinaty', cityAr: 'مدينتي', zone: 'B6', group: 'Villa Zones', groupAr: 'مناطق الفلل', type: 'Villa Zone', units: 145, availableUnits: 52, description: 'Premium villa zone near amenities', descriptionAr: 'منطقة فلل فاخرة بالقرب من المرافق' },
  { id: '5', name: 'B7', nameAr: 'ب7', city: 'Madinaty', cityAr: 'مدينتي', zone: 'B7', group: 'Villa Zones', groupAr: 'مناطق الفلل', type: 'Villa Zone', units: 138, availableUnits: 45, description: 'Exclusive villa community', descriptionAr: 'مجتمع فلل حصري' },
  { id: '6', name: 'B8', nameAr: 'ب8', city: 'Madinaty', cityAr: 'مدينتي', zone: 'B8', group: 'Villa Zones', groupAr: 'مناطق الفلل', type: 'Villa Zone', units: 122, availableUnits: 38, description: 'Garden villas with green spaces', descriptionAr: 'فلل حديقة مع مساحات خضراء' },
  { id: '7', name: 'B10', nameAr: 'ب10', city: 'Madinaty', cityAr: 'مدينتي', zone: 'B10', group: 'Villa Zones', groupAr: 'مناطق الفلل', type: 'Villa Zone', units: 115, availableUnits: 32, description: 'Modern villa designs', descriptionAr: 'تصميمات فلل عصرية' },
  { id: '8', name: 'B11', nameAr: 'ب11', city: 'Madinaty', cityAr: 'مدينتي', zone: 'B11', group: 'Villa Zones', groupAr: 'مناطق الفلل', type: 'Villa Zone', units: 128, availableUnits: 36, description: 'Premium location villas', descriptionAr: 'فلل في موقع متميز' },
  { id: '9', name: 'B12', nameAr: 'ب12', city: 'Madinaty', cityAr: 'مدينتي', zone: 'B12', group: 'Villa Zones', groupAr: 'مناطق الفلل', type: 'Villa Zone', units: 135, availableUnits: 48, description: 'Spacious villa community', descriptionAr: 'مجتمع فلل واسع' },
  
  // Madinaty Apartment Zones
  { id: '10', name: 'Madinaty Apartments', nameAr: 'شقق مدينتي', city: 'Madinaty', cityAr: 'مدينتي', group: 'Apartment Zones', groupAr: 'مناطق الشقق', type: 'Apartment Zone', units: 450, availableUnits: 145, description: 'Modern apartment buildings with amenities', descriptionAr: 'مباني شقق عصرية بمرافق متكاملة' },
  
  // Other Areas
  { id: '11', name: 'Rehab', nameAr: 'الرحاب', city: 'New Cairo', cityAr: 'القاهرة الجديدة', type: 'Mixed', units: 380, availableUnits: 142, description: 'Established residential community', descriptionAr: 'مجتمع سكني راسخ' },
  { id: '12', name: 'Celia', nameAr: 'سيليا', city: 'Fifth Settlement', cityAr: 'التجمع الخامس', type: 'Apartment Zone', units: 280, availableUnits: 87, description: 'High-rise luxury apartments', descriptionAr: 'شقق فاخرة عالية الارتفاع' },
  { id: '13', name: 'Thousand', nameAr: 'ألف', city: 'North Coast', cityAr: 'الساحل الشمالي', type: 'Villa Zone', units: 550, availableUnits: 245, description: 'Beachfront villa community', descriptionAr: 'مجتمع فلل على الشاطئ' },
  { id: '14', name: 'Sharm Bay', nameAr: 'شرم باي', city: 'Sharm El Sheikh', cityAr: 'شرم الشيخ', type: 'Mixed', units: 180, availableUnits: 134, description: 'Resort properties and residences', descriptionAr: 'عقارات منتجع ووحدات سكنية' },
];

export default function Areas() { // ✅ جعلناه Default Export لحل مشكلة الـ Lazy Loading
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // ✅ ربط المتغيرات بالسيستم الجديد لضمان استقرار الصفحة
  const { t, i18n } = useTranslation(['areas', 'common', 'properties', 'developers']); 
  const { dir } = useConfigStore(); 
  const { user } = useAuthStore();
  
  const isRTL = dir === 'rtl'; 
  const language = i18n.language;

  // --- الحفاظ على منطق الفلترة كما هو حرفياً ---
  const filteredAreas = mockAreas.filter(area => {
    const matchesSearch = 
      area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.nameAr.includes(searchTerm) ||
      area.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.cityAr.includes(searchTerm);
    
    const matchesType = filterType === 'all' || area.type === filterType;
    return matchesSearch && matchesType;
  });

  // الخريطة (Madinaty Villa Zones Map)
  const madinatyVillaZones = mockAreas.filter(area => 
    area.city === 'Madinaty' && area.type === 'Villa Zone'
  );

  // --- توابع الألوان والأيقونات (تبقى كما هي) ---
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Villa Zone': return 'bg-[#FEF3E2] text-[#B5752A] border-[#B5752A]';
      case 'Apartment Zone': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Service Area': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Mixed': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // ✅ أضف هذه الدالة هنا
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Villa Zone':
        return <Home className="w-4 h-4" />;
      case 'Apartment Zone':
      case 'Mixed':
        return <Building2 className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'Villa Zone': return t('areas:villaZone');
      case 'Apartment Zone': return t('areas:apartmentZone');
      case 'Service Area': return t('areas:serviceArea');
      case 'Mixed': return t('areas:mixed');
      default: return type;
    }
  };

  return (
    <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h1 className="text-2xl font-bold text-[#16100A] mb-2">{t('areas.management')}</h1>
            <p className="text-[#555555]">{t('areas.managementSubtitle')}</p>
          </div>
          <button className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all">
            <Plus className="w-5 h-5" />
            {t('areas.addArea')}
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]`} />
            <input
              type="text"
              placeholder={t('areas.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`}
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] ${isRTL ? 'text-right' : 'text-left'}`}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <option value="all">{t('areas.allTypes')}</option>
            <option value="Villa Zone">{t('areas.villaZone')}</option>
            <option value="Apartment Zone">{t('areas.apartmentZone')}</option>
            <option value="Service Area">{t('areas.serviceArea')}</option>
            <option value="Mixed">{t('areas.mixed')}</option>
          </select>
        </div>
      </div>

      {/* Madinaty Map Section */}
      <div className="bg-white rounded-lg border border-[#E5E5E5] p-6 mb-6">
        <div className={`mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
          <h2 className="font-bold text-[#16100A] mb-2">{t('areas.madinatyMap')}</h2>
          <p className="text-sm text-[#555555]">{t('areas.madinatyMapSubtitle')}</p>
        </div>

        {/* Map Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {['B1', 'B2', 'B3', null, null, null, 'B6', 'B7', 'B8', null, 'B10', null, 'B11', 'B12'].map((zone, index) => {
            if (!zone) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }
            
            const zoneData = madinatyVillaZones.find(z => z.zone === zone);
            const availability = zoneData ? Math.round((zoneData.availableUnits / zoneData.units) * 100) : 0;
            
            return (
              <div
                key={zone}
                className="aspect-square gradient-primary rounded-lg p-4 flex flex-col items-center justify-center text-white hover:shadow-lg transition-shadow cursor-pointer relative"
              >
                <Home className="w-6 h-6 mb-2 opacity-80" />
                <span className="font-bold text-lg">{language === 'ar' ? (zoneData?.nameAr || zone) : zone}</span>
                {zoneData && (
                  <>
                    <span className="text-xs mt-1 opacity-90">{zoneData.units} {t('areas.units')}</span>
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white" style={{ opacity: availability / 100 }} />
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-[#E5E5E5]">
          <div className={`flex items-center gap-6 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-3 h-3 rounded-full bg-white opacity-100" />
              <span className="text-[#555555]">{t('areas.highAvailability')}</span>
            </div>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-3 h-3 rounded-full bg-white opacity-50" />
              <span className="text-[#555555]">{t('areas.mediumAvailability')}</span>
            </div>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-3 h-3 rounded-full bg-white opacity-20" />
              <span className="text-[#555555]">{t('areas.lowAvailability')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Areas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAreas.map((area) => (
          <div key={area.id} className="bg-white rounded-lg border border-[#E5E5E5] p-6 hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h3 className="font-bold text-[#16100A] mb-1">{language === 'ar' ? area.nameAr : area.name}</h3>
                <div className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  {language === 'ar' ? area.cityAr : area.city}
                </div>
              </div>
              <button className="p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors">
                <Edit2 className="w-4 h-4 text-[#555555]" />
              </button>
            </div>

            {/* Type Badge */}
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-medium border mb-4 ${getTypeColor(area.type)}`}>
              {getTypeIcon(area.type)}
              {getTypeLabel(area.type)}
            </span>

            {/* Description */}
            <p className={`text-sm text-[#555555] mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              {language === 'ar' ? area.descriptionAr : area.description}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-[#E5E5E5]">
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-xs text-[#555555] mb-1">{t('developers:developers.totalUnits')}</p>
                <p className="font-bold text-[#16100A]">{area.units}</p>
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-xs text-[#555555] mb-1">{t('properties:properties.available')}</p>
                <p className="font-bold text-[#B5752A]">{area.availableUnits}</p>
              </div>
            </div>

            {/* Availability Progress */}
            <div>
              <div className={`flex items-center justify-between text-xs text-[#555555] mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>{t('areas.availability')}</span>
                <span>{Math.round((area.availableUnits / area.units) * 100)}%</span>
              </div>
              <div className="w-full bg-[#F7F7F7] rounded-full h-2">
                <div
                  className="h-2 rounded-full gradient-primary"
                  style={{ width: `${(area.availableUnits / area.units) * 100}%` }}
                />
              </div>
            </div>

            {/* Group Tag */}
            {area.group && (
              <div className={`mt-4 pt-4 border-t border-[#E5E5E5] ${isRTL ? 'text-right' : 'text-left'}`}>
                <span className="text-xs text-[#555555]">
                  {t('areas.group')}: <span className="font-medium text-[#16100A]">{language === 'ar' ? area.groupAr : area.group}</span>
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
