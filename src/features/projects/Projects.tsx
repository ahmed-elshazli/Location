import React, { useState } from 'react';
import { Plus, Search, MapPin, Building, Calendar, Edit2, TrendingUp, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // ✅ البديل الصحيح
import { useConfigStore } from '../../store/useConfigStore'; // ✅ لجلب الاتجاه
import { useAuthStore } from '../../store/useAuthStore'; // ✅ لجلب بيانات المستخدم
import { ImageWithFallback } from './components/ImageWithFallback';
import { useCreateProject } from './hooks/useCreateProject';
import { useDevelopers } from '../developers/hooks/useDevelopers';
import { useToastStore } from '../../store/useToastStore';
import z from 'zod';
import { useProjects } from './hooks/useProjects';
import { useProjectsStats } from './hooks/useProjectsStats';
import { useUpdateProject } from './hooks/useUpdateProject';
import { useDeleteProject } from './hooks/useDeleteProject';




export default function Projects() { // ✅ جعلناه Default Export لحل مشكلة الـ Lazy Loading
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // ✅ ربط المتغيرات بالسيستم الجديد لضمان استقرار الصفحة
  const { t, i18n } = useTranslation(['projects', 'common', 'properties', 'developers']); 
  const { dir } = useConfigStore(); 
  const { user } = useAuthStore();
  
  const isRTL = dir === 'rtl'; 
  const language = i18n.language;
  const createProject = useCreateProject();
  const { data: developersData } = useDevelopers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  // 1. تعريف حالة المودال (فتح/قفل)

// 2. ✅ السطر الناقص اللي هيحل المشكلة
const [isEditing, setIsEditing] = useState(false);
const updateProject = useUpdateProject();


// 3. حالة لتخزين معرف المشروع المختار عند التعديل
const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
const { data: projectsData, isLoading, error } = useProjects();
const deleteProject = useDeleteProject();

const projectList = Array.isArray(projectsData) 
    ? projectsData 
    : (projectsData?.data || []);

    const { data: statsData, isLoading: isStatsLoading } = useProjectsStats();
  
  // تأمين البيانات (استخدام أرقام افتراضية لو السيرفر لسه بيحمل)
  const stats = statsData?.data || statsData || {
    totalProjects: 0,
    totalUnits: 0,
    availableUnits: 0,
    soldUnits: 0
  };

  const [formData, setFormData] = useState({
    name: '', description: '', location: '', area: '',
    developer: '', startDate: '', status: 'Active'
  });
  const { triggerToast } = useToastStore();

// تعريف نظام التحقق (Schema) بناءً على متطلبات السيرفر
const projectSchema = z.object({
  name: z.string().min(3, "اسم المشروع مطلوب"),
  description: z.string().min(10, "الوصف يجب أن يكون مفصلاً"),
  location: z.string().nonempty("الموقع الجغرافي مطلوب"),
  area: z.string().nonempty("المنطقة مطلوبة"), // السيرفر يطلبها كـ string
  developer: z.string().nonempty("يجب اختيار مطور للمشروع"), // الـ Developer ID
  startDate: z.string().nonempty("تاريخ البدء مطلوب"),
  status: z.string().optional(),
});

const closeModal = () => {
  // 1. قفل واجهة المودال
  setIsModalOpen(false);
  
  // 2. تصفير حالة التعديل
  setIsEditing(false);
  setSelectedProjectId(null);
  
  // 3. تصفير بيانات الفورم بناءً على متطلبات السيرفر
  setFormData({
    name: '',
    description: '',
    location: '',
    area: '',
    developer: '',
    startDate: '',
    status: 'Active'
  });
};

 const handleSaveProject = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // التحقق من البيانات داخلياً
  const validation = projectSchema.safeParse(formData);
  if (!validation.success) {
    triggerToast(validation.error.issues[0].message, 'error'); 
    return;
  }

  // بناء الـ FormData
  const submissionData = new FormData();
  submissionData.append('name', formData.name); 
  submissionData.append('description', formData.description);
  submissionData.append('location', formData.location);
  submissionData.append('area', formData.area);
  submissionData.append('developer', formData.developer); // ✅ ده الـ _id دلوقتي
  
  // ✅ حل مشكلة الـ ISO Date
  try {
    const isoDate = new Date(formData.startDate).toISOString(); // تحويل التاريخ للصيغة العالمية
    submissionData.append('startDate', isoDate);
  } catch (err) {
    triggerToast("صيغة التاريخ غير صالحة", "error");
    return;
  }

  if (formData.status) submissionData.append('status', formData.status);
if (isEditing && selectedProjectId) {
    // حالة التعديل (PATCH)
    updateProject.mutate({ id: selectedProjectId, data: submissionData }, {
      onSuccess: () => {
        triggerToast("تم تحديث المشروع بنجاح ✅", "success");
        closeModal();
      },
      onError: (err: any) => {
        triggerToast(err.response?.data?.message?.[0] || "فشل التحديث", "error");
      }
    });
  } else {
    // حالة الإضافة (POST)
    createProject.mutate(submissionData, {
      onSuccess: () => {
        triggerToast("تم إضافة المشروع بنجاح 🏗️", "success");
        closeModal();
      },
      onError: (err: any) => {
        triggerToast(err.response?.data?.message?.[0] || "فشل الإضافة", "error");
      }
    });
  }
};

  // --- الحفاظ على كل توابع الفلترة والألوان كما هي حرفياً ---
  const filteredProjects = projectList.filter((project: any) => {
  // 1. منطق البحث بالاسم أو الموقع
  const searchTermLower = searchTerm.toLowerCase();
  const matchesSearch = 
    project.name?.toLowerCase().includes(searchTermLower) ||
    project.location?.toLowerCase().includes(searchTermLower) ||
    project.area?.toLowerCase().includes(searchTermLower);
  
  // 2. منطق الفلترة بالحالة (Status)
  // لو القيمة "all" بنعرض كله، غير كدة بنقارن بحالة المشروع
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

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B5752A]"></div>
      </div>
  }

  const handleDeleteProject = (id: string, name: string) => {
  // ✅ نافذة تأكيد بسيطة واحترافية
  if (window.confirm(`هل أنت متأكد من حذف مشروع "${name}"؟`)) {
    deleteProject.mutate(id, {
      onSuccess: () => {
        triggerToast("تم حذف المشروع بنجاح 🗑️", "success");
      },
      onError: (err: any) => {
        triggerToast(err.response?.data?.message || "فشل حذف المشروع", "error");
      }
    });
  }
};

  const handleEditClick = (project: any) => {
  // 1. تحديد المعرف الخاص بالمشروع (MongoDB ID)
  setSelectedProjectId(project._id || project.id);
  
  // 2. تفعيل وضع التعديل
  setIsEditing(true);
  
  // 3. ملء بيانات الفورم بالبيانات الحالية للمشروع
  setFormData({
    name: project.name || '',
    description: project.description || '',
    location: project.location || '',
    area: project.area || '',
    // تأكد من أخذ الـ ID الخاص بالمطور
    developer: project.developer?._id || project.developer || '', 
    // تحويل التاريخ لصيغة YYYY-MM-DD لتناسب Input التاريخ
    startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
    status: project.status || 'Active'
  });

  // 4. فتح المودال
  setIsModalOpen(true);
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
          <button onClick={() => {
    closeModal(); 
    setIsModalOpen(true);
  }} className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all">
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
          <p className="text-2xl font-bold text-[#16100A]">{isStatsLoading ? '...' : stats.totalProjects}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
          <p className={`text-sm text-[#555555] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('developers:developers.totalUnits')}</p>
          <p className="text-2xl font-bold text-[#16100A]">{isStatsLoading ? '...' : stats.totalUnits.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
          <p className={`text-sm text-[#555555] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('projects.availableUnits')}</p>
          <p className="text-2xl font-bold text-green-600">{isStatsLoading ? '...' : stats.availableUnits.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
          <p className={`text-sm text-[#555555] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('projects.soldUnits')}</p>
          <p className="text-2xl font-bold text-[#B5752A]">{isStatsLoading ? '...' : stats.soldUnits.toLocaleString()}</p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {filteredProjects.map((project: any) => {
    // ✅ 1. هنا نفتح { } عشان نقدر نعرف متغيراتنا لكل لفة (Loop)
    const totalUnits = project.units || 0;
    const soldUnits = project.soldUnits || 0;
    const availableUnits = project.availableUnits || 0;
    const salesPercentage = totalUnits > 0 ? Math.round((soldUnits / totalUnits) * 100) : 0;

    // ✅ 2. لازم نستخدم return يدوياً طالما فتحنا الأقواس المتعرجة
    return (
      <div key={project._id || project.id} className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden hover:shadow-lg transition-shadow">
        {/* Image Section */}
        <div className="h-48 overflow-hidden">
          <ImageWithFallback 
            src={project.image} 
            alt={language === 'ar' ? (project.nameAr || project.name) : project.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Section */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
              <h3 className="font-bold text-xl text-[#16100A] mb-1">
                {language === 'ar' ? (project.nameAr || project.name) : project.name}
              </h3>
              <div className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? 'flex-row-reverse' : ''}`}>
                <MapPin className="w-4 h-4 flex-shrink-0" />
                {language === 'ar' ? (project.locationAr || project.location) : project.location}
              </div>
            </div>
            <span className={`px-3 py-1 rounded text-xs font-medium border ${getStatusColor(project.status)}`}>
              {getStatusLabel(project.status)}
            </span>
          </div>

          {/* Description */}
          <p className={`text-sm text-[#555555] mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            {language === 'ar' ? (project.descriptionAr || project.description) : project.description}
          </p>

          {/* Details & Developer Info */}
          <div className="space-y-3 mb-4 pb-4 border-b border-[#E5E5E5]">
            <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-[#555555]">{t('common:common.area')}:</span>
              <span className="font-medium text-[#16100A]">{language === 'ar' ? project.areaAr : project.area}</span>
            </div>
            <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-[#555555]">{t('properties:properties.developer')}:</span>
              <span className="font-medium text-[#16100A]">
                {language === 'ar' 
                  ? (project.developer?.nameAr || project.developer?.name || t('common:common.none')) 
                  : (project.developer?.name || t('common:common.none'))
                }
              </span>
            </div>
            <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-[#555555]">{t('projects.startDate')}:</span>
              <span className="font-medium text-[#16100A]" dir="ltr">
                {project.startDate ? new Date(project.startDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : '---'}
              </span>
            </div>
          </div>

          {/* Units Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className={`text-center ${isRTL ? 'text-right' : 'text-left'}`}>
              <p className="text-xs text-[#555555] mb-1">{t('developers:developers.totalUnits')}</p>
              <p className="font-bold text-[#16100A]">{totalUnits.toLocaleString()}</p>
            </div>
            <div className={`text-center ${isRTL ? 'text-right' : 'text-left'}`}>
              <p className="text-xs text-[#555555] mb-1">{t('properties:properties.available')}</p>
              <p className="font-bold text-green-600">{availableUnits.toLocaleString()}</p>
            </div>
            <div className={`text-center ${isRTL ? 'text-right' : 'text-left'}`}>
              <p className="text-xs text-[#555555] mb-1">{t('properties:properties.sold')}</p>
              <p className="font-bold text-[#B5752A]">{soldUnits.toLocaleString()}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className={`flex items-center justify-between text-xs text-[#555555] mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span>{t('projects.salesProgress')}</span>
              <span>{salesPercentage}%</span>
            </div>
            <div className="w-full bg-[#F7F7F7] rounded-full h-2">
              <div
                className="h-2 rounded-full gradient-primary transition-all duration-500"
                style={{ width: `${salesPercentage}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button 
              onClick={() => console.log("View Details for:", project._id)} // ✅ استبدلها بـ handleViewDetails لو متعرفة
              className="flex-1 px-4 py-2 bg-[#F7F7F7] text-[#555555] rounded-lg hover:bg-[#E5E5E5] transition-colors text-sm font-medium"
            >
              {t('projects.viewDetails')}
            </button>
            <button 
              onClick={() => handleEditClick(project)} 
              className="px-4 py-2 bg-[#F7F7F7] rounded-lg hover:bg-[#E5E5E5] transition-colors"
            >
              <Edit2 className="w-4 h-4 text-[#555555]" />
            </button>
            <button 
    onClick={() => handleDeleteProject(project._id || project.id, project.name)} 
    disabled={deleteProject.isPending}
    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
  >
    <Trash2 className="w-4 h-4" /> 
  </button>
          </div>
        </div>
      </div>
    );
  })}
</div>
      {isModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
      {/* Modal Header */}
      <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between bg-[#F7F7F7]">
        <h2 className="text-xl font-bold text-[#16100A]">{t('projects.addProject')}</h2>
        <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <Plus className="w-6 h-6 rotate-45 text-[#555555]" />
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSaveProject} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
        {/* Project Name */}
        <div className="space-y-1">
          <label className="text-sm font-medium">{t('common:common.name')}</label>
          <input 
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none" 
          />
        </div>

        {/* Developer Dropdown - سحب المطورين من الـ API */}
        <div className="space-y-1">
          <label className="text-sm font-medium">{t('properties:properties.developer')}</label>
          <select 
            required
            value={formData.developer}
            onChange={(e) => setFormData({...formData, developer: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg outline-none"
          >
            <option value="">{t('developers:developers.selectDeveloper')}</option>
            {(developersData?.data || developersData || []).map((dev: any) => (
    <option key={dev._id} value={dev._id}> {/* استخدم _id بتاع المونجو */}
      {language === 'ar' ? dev.nameAr : dev.name}
    </option>
  ))}
          </select>
        </div>

        {/* Description - Full Width */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium">{t('common:common.description')}</label>
          <textarea 
            required
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg h-24 outline-none" 
          />
        </div>

        {/* Location & Area */}
        <div className="space-y-1">
          <label className="text-sm font-medium">{t('common:common.location')}</label>
          <input 
            required
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg outline-none" 
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">{t('common:common.area')}</label>
          <input 
            required
            value={formData.area}
            onChange={(e) => setFormData({...formData, area: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg outline-none" 
          />
        </div>

        {/* Start Date & Status */}
        <div className="space-y-1">
          <label className="text-sm font-medium">{t('projects.startDate')}</label>
          <input 
            type="date"
            required
            value={formData.startDate}
            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg outline-none" 
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">{t('properties:properties.status')}</label>
          <select 
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg outline-none"
          >
            <option value="Active">{t('projects.active')}</option>
            <option value="Upcoming">{t('projects.upcoming')}</option>
            <option value="Completed">{t('projects.completed')}</option>
          </select>
        </div>

        {/* Modal Footer */}
        <div className="md:col-span-2 pt-4 flex justify-end gap-3 border-t mt-4">
          <button type="button" onClick={closeModal} className="px-6 py-2 border rounded-lg hover:bg-gray-100 transition-colors">
            {t('common:common.cancel')}
          </button>
          <button type="submit" disabled={createProject.isPending} className="px-8 py-2 gradient-primary text-white rounded-lg font-bold disabled:opacity-50">
            {createProject.isPending ? '...' : t('common:common.save')}
          </button>
        </div>
      </form>
    </div>
  </div>
)}


    </div>
  );
}
