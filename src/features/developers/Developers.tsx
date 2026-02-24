import React, { useState } from 'react';
import { Plus, Search, Building, MapPin, Phone, Mail, Edit2, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // ✅ البديل الصحيح
import { useConfigStore } from '../../store/useConfigStore'; // ✅ لجلب الاتجاه
import { useAuthStore } from '../../store/useAuthStore'; // ✅ لجلب بيانات المستخدم

// ... (واجهة Developer ومصفوفة mockDevelopers تبقى كما هي تماماً)
interface Developer {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  phone: string;
  email: string;
  website?: string;
  projects: number;
  totalUnits: number;
  areas: string[];
  areasAr: string[];
}

const mockDevelopers: Developer[] = [
  {
    id: '1',
    name: 'Talaat Moustafa Group',
    nameAr: 'مجموعة طلعت مصطفى',
    description: 'Leading real estate developer in Egypt with premium residential and commercial projects',
    descriptionAr: 'المطور العقاري الرائد في مصر مع مشاريع سكنية وتجارية فاخرة',
    phone: '+20 2 3854 0000',
    email: 'info@tmg.com.eg',
    website: 'www.tmg.com.eg',
    projects: 8,
    totalUnits: 1248,
    areas: ['Madinaty', 'Rehab', 'Celia'],
    areasAr: ['مدينتي', 'الرحاب', 'سيليا'],
  },
  {
    id: '2',
    name: 'Palm Hills Developments',
    nameAr: 'بالم هيلز للتطوير',
    description: 'Premium residential communities and integrated developments across Egypt',
    descriptionAr: 'مجتمعات سكنية فاخرة ومشاريع متكاملة في جميع أنحاء مصر',
    phone: '+20 2 3539 0000',
    email: 'info@palmhills.com',
    website: 'www.palmhills.com',
    projects: 3,
    totalUnits: 456,
    areas: ['Thousand', 'Sharm Bay'],
    areasAr: ['ألف', 'شرم باي'],
  },
  {
    id: '3',
    name: 'Emaar Misr',
    nameAr: 'إعمار مصر',
    description: 'International developer known for luxury properties and world-class communities',
    descriptionAr: 'مطور عقاري دولي معروف بالعقارات الفاخرة والمجتمعات العالمية',
    phone: '+20 2 3854 1111',
    email: 'info@emaarmisr.com',
    website: 'www.emaarmisr.com',
    projects: 5,
    totalUnits: 678,
    areas: ['Madinaty', 'Celia'],
    areasAr: ['مدينتي', 'سيليا'],
  },
  {
    id: '4',
    name: 'Sodic',
    nameAr: 'سوديك',
    description: 'Developer of upscale residential compounds and urban communities',
    descriptionAr: 'مطور المجمعات السكنية الراقية والمجتمعات الحضرية',
    phone: '+20 2 3827 0000',
    email: 'info@sodic.com',
    website: 'www.sodic.com',
    projects: 6,
    totalUnits: 892,
    areas: ['Rehab', 'Thousand'],
    areasAr: ['الرحاب', 'ألف'],
  },
];
export default function Developers() { // ✅ جعلناه Default Export لحل مشكلة الـ Lazy Loading
  const [searchTerm, setSearchTerm] = useState('');
  
  // ✅ ربط المتغيرات بالسيستم الجديد لضمان استقرار الصفحة
  const { t, i18n } = useTranslation(['developers', 'common']); 
  const { dir } = useConfigStore(); 
  const { user } = useAuthStore();
  
  const isRTL = dir === 'rtl'; 
  const language = i18n.language;

  // --- الحفاظ على منطق الفلترة كما هو حرفياً ---
  const filteredDevelopers = mockDevelopers.filter(dev => {
    const matchesSearch = 
      dev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dev.nameAr.includes(searchTerm) ||
      dev.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h1 className="text-2xl font-bold text-[#16100A] mb-2">{t('developers.management')}</h1>
            <p className="text-[#555555]">{t('developers.managementSubtitle')}</p>
          </div>
          <button className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all">
            <Plus className="w-5 h-5" />
            {t('developers.addDeveloper')}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]`} />
          <input
            type="text"
            placeholder={t('developers.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
          <p className={`text-sm text-[#555555] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('developers.totalDevelopers')}</p>
          <p className="text-2xl font-bold text-[#16100A]">{mockDevelopers.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
          <p className={`text-sm text-[#555555] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('developers.totalProjects')}</p>
          <p className="text-2xl font-bold text-[#16100A]">{mockDevelopers.reduce((sum, d) => sum + d.projects, 0)}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
          <p className={`text-sm text-[#555555] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('developers.totalUnits')}</p>
          <p className="text-2xl font-bold text-[#16100A]">{mockDevelopers.reduce((sum, d) => sum + d.totalUnits, 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Developers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDevelopers.map((developer) => (
          <div key={developer.id} className="bg-white rounded-lg border border-[#E5E5E5] p-6 hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <h3 className="font-bold text-[#16100A]">{language === 'ar' ? developer.nameAr : developer.name}</h3>
                  <p className="text-xs text-[#555555]">{t('developers.developerId')}: {developer.id}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors">
                <Edit2 className="w-4 h-4 text-[#555555]" />
              </button>
            </div>

            {/* Description */}
            <p className={`text-sm text-[#555555] mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              {language === 'ar' ? developer.descriptionAr : developer.description}
            </p>

            {/* Contact Info */}
            <div className="space-y-2 mb-4 pb-4 border-b border-[#E5E5E5]">
              <div className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span dir="ltr">{developer.phone}</span>
              </div>
              <div className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span dir="ltr">{developer.email}</span>
              </div>
              {developer.website && (
                <div className={`flex items-center gap-2 text-sm text-[#B5752A] ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Globe className="w-4 h-4 flex-shrink-0" />
                  <span dir="ltr">{developer.website}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-xs text-[#555555] mb-1">{t('developers.projects')}</p>
                <p className="font-bold text-[#16100A]">{developer.projects}</p>
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-xs text-[#555555] mb-1">{t('developers.totalUnits')}</p>
                <p className="font-bold text-[#B5752A]">{developer.totalUnits.toLocaleString()}</p>
              </div>
            </div>

            {/* Areas */}
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className={`text-sm font-medium text-[#16100A] mb-2 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <MapPin className="w-4 h-4" />
                {t('developers.activeAreas')}:
              </p>
              <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                {(language === 'ar' ? developer.areasAr : developer.areas).map((area, idx) => (
                  <span key={idx} className="px-3 py-1 bg-[#F7F7F7] text-[#555555] text-sm rounded-lg">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
