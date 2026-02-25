import React, { useState } from 'react';
import { Plus, Search, MapPin, Building, Calendar, Edit2, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // ✅ البديل الصحيح
import { useConfigStore } from '../../store/useConfigStore'; // ✅ لجلب الاتجاه
import { useAuthStore } from '../../store/useAuthStore'; // ✅ لجلب بيانات المستخدم
import { ImageWithFallback } from './components/ImageWithFallback';

// ... (واجهة Project ومصفوفة mockProjects تبقى كما هي تماماً)
interface Project {
  id: string;
  name: string;
  nameAr: string;
  location: string;
  locationAr: string;
  area: string;
  areaAr: string;
  developer: string;
  developerAr: string;
  units: number;
  availableUnits: number;
  soldUnits: number;
  startDate: string;
  status: 'Active' | 'Completed' | 'Upcoming';
  description: string;
  descriptionAr: string;
  image: string;
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Madinaty Residential Complex',
    nameAr: 'مجمع مدينتي السكني',
    location: 'Cairo-Suez Road',
    locationAr: 'طريق القاهرة السويس',
    area: 'Madinaty',
    areaAr: 'مدينتي',
    developer: 'Talaat Moustafa Group',
    developerAr: 'مجموعة طلعت مصطفى',
    units: 850,
    availableUnits: 234,
    soldUnits: 616,
    startDate: '2024-01-15',
    status: 'Active',
    description: 'Premium residential community with modern amenities and facilities',
    descriptionAr: 'مجتمع سكني فاخر بمرافق ووسائل راحة عصرية',
    image: 'https://images.unsplash.com/photo-1760153560407-61cb201349b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNpZGVudGlhbCUyMGNvbW11bml0eSUyMHByb2plY3R8ZW58MXx8fHwxNzcwOTA1MjU2fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '2',
    name: 'Rehab City Extension',
    nameAr: 'امتداد مدينة الرحاب',
    location: 'New Cairo',
    locationAr: 'القاهرة الجديدة',
    area: 'Rehab',
    areaAr: 'الرحاب',
    developer: 'Talaat Moustafa Group',
    developerAr: 'مجموعة طلعت مصطفى',
    units: 420,
    availableUnits: 156,
    soldUnits: 264,
    startDate: '2024-06-01',
    status: 'Active',
    description: 'Family-oriented community with excellent connectivity',
    descriptionAr: 'مجتمع عائلي موجه مع اتصال ممتاز',
    image: 'https://images.unsplash.com/photo-1770064319484-80ca833d0962?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWFsJTIwZXN0YXRlJTIwZGV2ZWxvcG1lbnQlMjBwcm9qZWN0fGVufDF8fHx8MTc3MDkwNTI1N3ww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '3',
    name: 'Celia Towers',
    nameAr: 'أبراج سيليا',
    location: 'Fifth Settlement',
    locationAr: 'التجمع الخامس',
    area: 'Celia',
    areaAr: 'سيليا',
    developer: 'Talaat Moustafa Group',
    developerAr: 'مجموعة طلعت مصطفى',
    units: 280,
    availableUnits: 87,
    soldUnits: 193,
    startDate: '2023-09-20',
    status: 'Active',
    description: 'Luxury high-rise apartments with stunning views',
    descriptionAr: 'شقق فاخرة عالية الارتفاع مع إطلالات خلابة',
    image: 'https://images.unsplash.com/photo-1648502298359-055a3f374705?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhcGFydG1lbnQlMjB0b3dlcnN8ZW58MXx8fHwxNzcwOTA1MjU3fDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '4',
    name: 'Thousand Villas',
    nameAr: 'فلل ألف',
    location: 'North Coast',
    locationAr: 'الساحل الشمالي',
    area: 'Thousand',
    areaAr: 'ألف',
    developer: 'Palm Hills Developments',
    developerAr: 'بالم هيلز للتطوير',
    units: 550,
    availableUnits: 245,
    soldUnits: 305,
    startDate: '2024-03-10',
    status: 'Active',
    description: 'Exclusive villa community in prime North Coast location',
    descriptionAr: 'مجتمع فلل حصري في موقع رئيسي بالساحل الشمالي',
    image: 'https://images.unsplash.com/photo-1767857214296-d13a3c7cdd26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWxsYSUyMGNvbW11bml0eSUyMHJlc29ydHxlbnwxfHx8fDE3NzA5MDUyNTd8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '5',
    name: 'Sharm Bay Resort',
    nameAr: 'منتجع شرم باي',
    location: 'Sharm El Sheikh',
    locationAr: 'شرم الشيخ',
    area: 'Sharm Bay',
    areaAr: 'شرم باي',
    developer: 'Palm Hills Developments',
    developerAr: 'بالم هيلز للتطوير',
    units: 180,
    availableUnits: 134,
    soldUnits: 46,
    startDate: '2025-01-05',
    status: 'Upcoming',
    description: 'Beachfront resort properties with world-class amenities',
    descriptionAr: 'منتجع على الشاطئ مع مرافق عالمية المستوى',
    image: 'https://images.unsplash.com/photo-1765639729357-3c0346e3533d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHJlc29ydCUyMHByb3BlcnR5fGVufDF8fHx8MTc3MDkwNTI1OHww&ixlib=rb-4.1.0&q=80&w=1080'
  },
];

export default function Projects() { // ✅ جعلناه Default Export لحل مشكلة الـ Lazy Loading
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // ✅ ربط المتغيرات بالسيستم الجديد لضمان استقرار الصفحة
  const { t, i18n } = useTranslation(['projects', 'common', 'properties', 'developers']); 
  const { dir } = useConfigStore(); 
  const { user } = useAuthStore();
  
  const isRTL = dir === 'rtl'; 
  const language = i18n.language;

  // --- الحفاظ على كل توابع الفلترة والألوان كما هي حرفياً ---
  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.nameAr.includes(searchTerm) ||
      project.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.areaAr.includes(searchTerm) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.locationAr.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-50 text-green-700 border-green-200';
      case 'Completed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Upcoming': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Active': return t('projects.active');
      case 'Completed': return t('projects.completed');
      case 'Upcoming': return t('projects.upcoming');
      default: return status;
    }
  };
  return (
    <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h1 className="text-2xl font-bold text-[#16100A] mb-2">{t('projects.management')}</h1>
            <p className="text-[#555555]">{t('projects.managementSubtitle')}</p>
          </div>
          <button className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all">
            <Plus className="w-5 h-5" />
            {t('projects.addProject')}
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]`} />
            <input
              type="text"
              placeholder={t('projects.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`}
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] ${isRTL ? 'text-right' : 'text-left'}`}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <option value="all">{t('properties:properties.allStatus')}</option>
            <option value="Active">{t('projects.active')}</option>
            <option value="Completed">{t('projects.completed')}</option>
            <option value="Upcoming">{t('projects.upcoming')}</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
          <p className={`text-sm text-[#555555] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('projects.totalProjects')}</p>
          <p className="text-2xl font-bold text-[#16100A]">{mockProjects.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
          <p className={`text-sm text-[#555555] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('developers:developers.totalUnits')}</p>
          <p className="text-2xl font-bold text-[#16100A]">{mockProjects.reduce((sum, p) => sum + p.units, 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
          <p className={`text-sm text-[#555555] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('projects.availableUnits')}</p>
          <p className="text-2xl font-bold text-green-600">{mockProjects.reduce((sum, p) => sum + p.availableUnits, 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
          <p className={`text-sm text-[#555555] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('projects.soldUnits')}</p>
          <p className="text-2xl font-bold text-[#B5752A]">{mockProjects.reduce((sum, p) => sum + p.soldUnits, 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden hover:shadow-lg transition-shadow">
            {/* Image */}
            <div className="h-48 overflow-hidden">
              <ImageWithFallback 
                src={project.image} 
                alt={language === 'ar' ? project.nameAr : project.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <h3 className="font-bold text-xl text-[#16100A] mb-1">{language === 'ar' ? project.nameAr : project.name}</h3>
                  <div className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    {language === 'ar' ? project.locationAr : project.location}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded text-xs font-medium border ${getStatusColor(project.status)}`}>
                  {getStatusLabel(project.status)}
                </span>
              </div>

              {/* Description */}
              <p className={`text-sm text-[#555555] mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? project.descriptionAr : project.description}
              </p>

              {/* Details */}
              <div className="space-y-3 mb-4 pb-4 border-b border-[#E5E5E5]">
                <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-[#555555]">{t('common:common.area')}:</span>
                  <span className="font-medium text-[#16100A]">{language === 'ar' ? project.areaAr : project.area}</span>
                </div>
                <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-[#555555]">{t('properties:properties.developer')}:</span>
                  <span className="font-medium text-[#16100A]">{language === 'ar' ? project.developerAr : project.developer}</span>
                </div>
                <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-[#555555]">{t('projects.startDate')}:</span>
                  <span className="font-medium text-[#16100A]" dir="ltr">{new Date(project.startDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                </div>
              </div>

              {/* Units Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className={`text-center ${isRTL ? 'text-right' : 'text-left'}`}>
                  <p className="text-xs text-[#555555] mb-1">{t('developers:developers.totalUnits')}</p>
                  <p className="font-bold text-[#16100A]">{project.units}</p>
                </div>
                <div className={`text-center ${isRTL ? 'text-right' : 'text-left'}`}>
                  <p className="text-xs text-[#555555] mb-1">{t('properties:properties.available')}</p>
                  <p className="font-bold text-green-600">{project.availableUnits}</p>
                </div>
                <div className={`text-center ${isRTL ? 'text-right' : 'text-left'}`}>
                  <p className="text-xs text-[#555555] mb-1">{t('properties:properties.sold')}</p>
                  <p className="font-bold text-[#B5752A]">{project.soldUnits}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className={`flex items-center justify-between text-xs text-[#555555] mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>{t('projects.salesProgress')}</span>
                  <span>{Math.round((project.soldUnits / project.units) * 100)}%</span>
                </div>
                <div className="w-full bg-[#F7F7F7] rounded-full h-2">
                  <div
                    className="h-2 rounded-full gradient-primary"
                    style={{ width: `${(project.soldUnits / project.units) * 100}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-[#F7F7F7] text-[#555555] rounded-lg hover:bg-[#E5E5E5] transition-colors text-sm font-medium">
                  {t('projects.viewDetails')}
                </button>
                <button className="px-4 py-2 bg-[#F7F7F7] rounded-lg hover:bg-[#E5E5E5] transition-colors">
                  <Edit2 className="w-4 h-4 text-[#555555]" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
