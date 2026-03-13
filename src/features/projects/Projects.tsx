import React, { useState, useRef } from 'react';
import { Plus, Search, MapPin, Building, Calendar, Edit2, Trash2, FileText, X, User, ChevronLeft, ChevronRight, Upload, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../store/useConfigStore';
import { useAuthStore } from '../../store/useAuthStore';
import { ImageWithFallback } from './components/ImageWithFallback';
import { useCreateProject } from './hooks/useCreateProject';
import { useDevelopers } from '../developers/hooks/useDevelopers';
import { useToastStore } from '../../store/useToastStore';
import z from 'zod';
import { useProjects } from './hooks/useProjects';
import { useProjectsStats } from './hooks/useProjectsStats';
import { useUpdateProject } from './hooks/useUpdateProject';
import { useDeleteProject } from './hooks/useDeleteProject';
import { useProjectsSummary } from './hooks/useProjectSummary';
import { useNavigate } from 'react-router';

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const { t, i18n } = useTranslation(['projects', 'common', 'properties', 'developers']);
  const { dir } = useConfigStore();
  const { user } = useAuthStore();

  const isRTL = dir === 'rtl';
  const language = i18n.language;
  const createProject = useCreateProject();
  const { data: developersData } = useDevelopers();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // ─── Image Upload ─────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = 5 - imagePreviews.filter(p => p.startsWith('http')).length - imageFiles.length;
    const toAdd = files.slice(0, Math.max(0, remaining));
    if (toAdd.length === 0) return;
    setImageFiles(prev => [...prev, ...toAdd]);
    toAdd.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };
  const [isEditing, setIsEditing] = useState(false);
  const updateProject = useUpdateProject();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const { data: projectsData, isLoading } = useProjects(currentPage);
  const deleteProject = useDeleteProject();



  // ─── Confirm Delete Modal ─────────────────────────────────────────────────
  const [deleteConfig, setDeleteConfig] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false, id: '', name: ''
  });

  const { data: statsData, isLoading: isStatsLoading } = useProjectsStats();

  const stats = statsData?.data || statsData || {
    totalProjects: 0, totalUnits: 0, availableUnits: 0, soldUnits: 0
  };

  const [formData, setFormData] = useState({
    name: '', description: '', location: '', area: '',
    developer: '', startDate: '', status: 'Active',
    units: 0, availableUnits: 0, soldUnits: 0
  });

  const { triggerToast } = useToastStore();

  const projectSchema = z.object({
    name: z.string().min(3, "اسم المشروع مطلوب"),
    description: z.string().min(10, "الوصف يجب أن يكون مفصلاً"),
    location: z.string().nonempty("الموقع الجغرافي مطلوب"),
    area: z.string().nonempty("المنطقة مطلوبة"),
    developer: z.string().nonempty("يجب اختيار مطور للمشروع"),
    startDate: z.string().nonempty("تاريخ البدء مطلوب"),
    status: z.string().optional(),
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setSelectedProjectId(null);
    setImageFiles([]);
    setImagePreviews([]);
    setImageFiles([]);
    setImagePreviews([]);
    setFormData({
      name: '', description: '', location: '', area: '',
      developer: '', startDate: '', status: 'Active',
      units: 0, availableUnits: 0, soldUnits: 0
    });
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = projectSchema.safeParse(formData);
    if (!validation.success) {
      triggerToast(validation.error.issues[0].message, 'error');
      return;
    }

    const submissionData = new FormData();
    submissionData.append('name', formData.name);
    submissionData.append('description', formData.description);
    submissionData.append('location', formData.location);
    submissionData.append('area', formData.area);
    submissionData.append('developer', formData.developer);

    try {
      const isoDate = new Date(formData.startDate).toISOString();
      submissionData.append('startDate', isoDate);
    } catch {
      triggerToast("صيغة التاريخ غير صالحة", "error");
      return;
    }

    if (formData.status) submissionData.append('status', formData.status);

    // ✅ الصورة في الـ create والـ update
    // ⚠️ الباك-إند بيستبدل الصور كلها لما تبعت images جديدة
    if (imageFiles.length > 0) {
      imageFiles.forEach(file => submissionData.append('images', file));
    }

    if (isEditing && selectedProjectId) {
      updateProject.mutate({ id: selectedProjectId, data: submissionData }, {
        onSuccess: () => { triggerToast("تم تحديث المشروع بنجاح ✅", "success"); closeModal(); },
        onError: (err: any) => { triggerToast(err.response?.data?.message?.[0] || "فشل التحديث", "error"); }
      });
    } else {
      createProject.mutate(submissionData, {
        onSuccess: () => { triggerToast("تم إضافة المشروع بنجاح 🏗️", "success"); closeModal(); },
        onError: (err: any) => { triggerToast(err.response?.data?.message?.[0] || "فشل الإضافة", "error"); }
      });
    }
  };

  const projectList: any[] = Array.isArray(projectsData?.data)
    ? projectsData.data
    : Array.isArray(projectsData)
    ? projectsData
    : [];

  const pagination  = projectsData?.pagination;
  const totalPages  = pagination?.numberOfPages ?? 1;

  const filteredProjects = projectList.filter((project: any) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      project.name?.toLowerCase().includes(searchLower) ||
      project.location?.toLowerCase().includes(searchLower) ||
      project.area?.toLowerCase().includes(searchLower);
    const matchesStatus =
      filterStatus === 'all' ||
      project.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const paginatedProjects = filteredProjects;
  const navigate = useNavigate();
  const projectSummaries = useProjectsSummary(paginatedProjects);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':    return 'bg-green-50 text-green-700 border-green-200';
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'upcoming':  return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'inactive':  return 'bg-gray-50 text-gray-500 border-gray-200';
      case 'sold out':  return 'bg-red-50 text-red-600 border-red-200';
      default:          return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':    return t('projects.active');
      case 'completed': return t('projects.completed');
      case 'upcoming':  return t('projects.upcoming');
      case 'inactive':  return t('projects.inactive');
      case 'sold out':  return t('projects.soldOut');
      default: return status;
    }
  };

  const handleDeleteProject = (id: string, name: string) => {
    setDeleteConfig({ isOpen: true, id, name });
  };

  const confirmDelete = () => {
    deleteProject.mutate(deleteConfig.id, {
      onSuccess: () => {
        triggerToast("تم حذف المشروع بنجاح 🗑️", "success");
        setDeleteConfig({ isOpen: false, id: '', name: '' });
      },
      onError: (err: any) => {
        triggerToast(err.response?.data?.message || "فشل حذف المشروع", "error");
      }
    });
  };

  const handleEditClick = (project: any) => {
    setSelectedProjectId(project._id || project.id);
    setIsEditing(true);
    setImageFiles([]);
    setImagePreviews(project.images || (project.image ? [project.image] : []));
    setFormData({
      name: project.name || '',
      description: project.description || '',
      location: project.location || '',
      area: project.area || '',
      developer: project.developer?._id || project.developer || '',
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      status: project.status || 'Active',
      units: project.units || 0,
      availableUnits: project.availableUnits || 0,
      soldUnits: project.soldUnits || 0,
    });
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B5752A]"></div>
      </div>
    );
  }

  return (
    <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h1 className="text-2xl font-bold text-[#16100A] mb-2">{t('projects.management')}</h1>
            <p className="text-[#555555]">{t('projects.managementSubtitle')}</p>
          </div>
          <button
            onClick={() => { closeModal(); setIsModalOpen(true); }}
            className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all"
          >
            <Plus className="w-5 h-5" />
            {t('projects.addProject')}
          </button>
        </div>

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
            <option value="active">{t('projects.active')}</option>
            <option value="completed">{t('projects.completed')}</option>
            <option value="upcoming">{t('projects.upcoming')}</option>
            <option value="inactive">{t('projects.inactive')}</option>
            <option value="sold out">{t('projects.soldOut')}</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: t('projects.totalProjects'),           value: stats.totalProjects,                   color: 'text-[#16100A]' },
          { label: t('developers:developers.totalUnits'), value: stats.totalUnits?.toLocaleString(),    color: 'text-[#16100A]' },
          { label: t('projects.availableUnits'),          value: stats.availableUnits?.toLocaleString(), color: 'text-green-600' },
          { label: t('projects.soldUnits'),               value: stats.soldUnits?.toLocaleString(),     color: 'text-[#B5752A]' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-lg border border-[#E5E5E5] p-6">
            <p className={`text-sm text-[#555555] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{isStatsLoading ? '...' : stat.value}</p>
          </div>
        ))}
      </div>

      {/* Results count */}
      <div className={`mb-4 text-sm text-[#555555] ${isRTL ? 'text-right' : 'text-left'}`}>
        {isRTL
          ? `عرض ${paginatedProjects.length} من ${filteredProjects.length} مشروع`
          : `Showing ${paginatedProjects.length} of ${filteredProjects.length} projects`}
      </div>

      {/* Projects Grid */}
      {paginatedProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#AAAAAA]">
          <Building className="w-16 h-16 mb-4 opacity-30" />
          <p className="text-lg font-medium">
            {isRTL ? 'لا توجد مشاريع مطابقة' : 'No projects found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {paginatedProjects.map((project: any, index: number) => {
            const summary = projectSummaries[index]?.data;
            const totalUnits = summary?.totalUnits || project.units || 0;
            const soldUnits = summary?.soldUnits || 0;
            const availableUnits = summary?.availableUnits || 0;
            const salesPercentage = totalUnits > 0 ? Math.round((soldUnits / totalUnits) * 100) : 0;

            return (
              <div key={project._id || project.id} className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 overflow-hidden">
                  <ImageWithFallback
                    src={project.images?.[0] || project.image}
                    alt={language === 'ar' ? (project.nameAr || project.name) : project.name}
                    className="w-full h-full object-cover"
                  />
                </div>
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

                  <p className={`text-sm text-[#555555] mb-4 line-clamp-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {language === 'ar' ? (project.descriptionAr || project.description) : project.description}
                  </p>

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
                          : (project.developer?.name || t('common:common.none'))}
                      </span>
                    </div>
                    <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-[#555555]">{t('projects.startDate')}:</span>
                      <span className="font-medium text-[#16100A]" dir="ltr">
                        {project.startDate ? new Date(project.startDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : '---'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {[
                      { label: t('developers:developers.totalUnits'), value: totalUnits.toLocaleString(),      color: 'text-[#16100A]' },
                      { label: t('properties:properties.available'),  value: availableUnits.toLocaleString(),  color: 'text-green-600' },
                      { label: t('properties:properties.sold'),       value: soldUnits.toLocaleString(),       color: 'text-[#B5752A]' },
                    ].map((stat, i) => (
                      <div key={i} className={isRTL ? 'text-right' : 'text-left'}>
                        <p className="text-xs text-[#555555] mb-1">{stat.label}</p>
                        <p className={`font-bold ${stat.color}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mb-4">
                    <div className={`flex items-center justify-between text-xs text-[#555555] mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span>{t('projects.salesProgress')}</span>
                      <span>{salesPercentage}%</span>
                    </div>
                    <div className="w-full bg-[#F7F7F7] rounded-full h-2">
                      <div className="h-2 rounded-full gradient-primary transition-all duration-500" style={{ width: `${salesPercentage}%` }} />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/projects/${project._id}`)}
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
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={`flex items-center justify-center gap-2 mt-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1 || isLoading}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E5E5] hover:bg-[#F7F7F7] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
            const isFirst = page === 1;
            const isLast  = page === totalPages;
            const isNear  = Math.abs(page - currentPage) <= 1;
            if (!isFirst && !isLast && !isNear) {
              if (page === 2 || page === totalPages - 1)
                return <span key={page} className="text-[#555555] text-sm px-1">...</span>;
              return null;
            }
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                disabled={isLoading}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                  page === currentPage
                    ? 'gradient-primary text-white shadow-sm'
                    : 'border border-[#E5E5E5] text-[#555555] hover:bg-[#F7F7F7]'
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || isLoading}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E5E5] hover:bg-[#F7F7F7] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          <span className="text-xs text-[#555555] mx-2">
            {language === 'ar'
              ? `صفحة ${currentPage} من ${totalPages}`
              : `Page ${currentPage} of ${totalPages}`}
          </span>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {deleteConfig.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-[#16100A] mb-2">{t('common:common.confirmDelete')}</h3>
              <p className="text-[#555555] mb-6">
                {isRTL
                  ? `هل أنت متأكد من حذف مشروع "${deleteConfig.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`
                  : `Are you sure you want to delete "${deleteConfig.name}"? This action cannot be undone.`}
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDeleteConfig({ isOpen: false, id: '', name: '' })}
                  className="flex-1 px-4 py-2 border border-[#E5E5E5] rounded-lg text-[#555555] hover:bg-[#F7F7F7] font-medium transition-colors"
                >
                  {t('common:common.cancel')}
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteProject.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold transition-colors disabled:opacity-50"
                >
                  {deleteProject.isPending ? '...' : t('common:common.delete', 'حذف')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between bg-white">
              <h2 className="text-xl font-bold text-[#16100A]">
                {isEditing ? t('projects.editProject') : t('projects.addProject')}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-[#555555]" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="px-6 py-4 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">

              {/* Auto-Translation Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-sm text-blue-700">
                  💡 {language === 'ar'
                    ? 'يمكنك الكتابة بأي لغة - سيتم الترجمة التلقائية للغة الأخرى'
                    : 'You can write in any language - auto-translation will handle the rest'}
                </p>
              </div>



              {/* ✅ Image Upload */}
              {(
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[#16100A] flex items-center gap-2 flex-wrap">
                    {language === 'ar' ? 'صور المشروع' : 'Project Images'}
                    {isEditing && (
                      <span className="text-xs font-normal text-orange-500">
                        {language === 'ar' ? '⚠️ رفع صور جديدة سيحذف القديمة' : '⚠️ Uploading new images will replace existing ones'}
                      </span>
                    )}
                  </label>
                  {/* Previews grid */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-5 gap-2 mb-2">
                      {imagePreviews.map((src, idx) => (
                        <div key={idx} className="relative group">
                          <img src={src} alt={`img-${idx}`} className="w-full h-16 object-cover rounded-lg border border-[#E5E5E5]" />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreviews(prev => prev.filter((_, i) => i !== idx));
                              if (!src.startsWith('http')) {
                                setImageFiles(prev => prev.filter((_, i) => {
                                  const newFileIdx = imagePreviews.filter((p,pi) => pi < idx && !p.startsWith('http')).length;
                                  return i !== newFileIdx;
                                }));
                              }
                            }}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >×</button>
                        </div>
                      ))}
                    </div>
                  )}
                  {imagePreviews.length < 5 && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer border-2 border-dashed border-[#E5E5E5] rounded-xl h-24 flex flex-col items-center justify-center gap-1 text-[#AAAAAA] hover:border-[#B5752A] transition-colors"
                    >
                      <Upload className="w-7 h-7" />
                      <p className="text-xs">
                        {language === 'ar'
                          ? `أضف صورة (${imagePreviews.length}/5)`
                          : `Add image (${imagePreviews.length}/5)`}
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              )}

              {/* Project Name */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#16100A]">{t('projects.projectName')} *</label>
                <div className="relative">
                  <Building className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAAAAA]`} />
                  <input
                    type="text" required value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none text-sm`}
                    placeholder={language === 'ar' ? 'مجمع سكني فاخر' : 'Luxury Residential Complex'}
                  />
                </div>
              </div>

              {/* Location & Area */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[#16100A]">{t('common:common.location')} *</label>
                  <div className="relative">
                    <MapPin className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAAAAA]`} />
                    <input
                      type="text" required value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none text-sm`}
                      placeholder={language === 'ar' ? 'القاهرة الجديدة' : 'New Cairo'}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[#16100A]">{t('common:common.area')} *</label>
                  <div className="relative">
                    <MapPin className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAAAAA]`} />
                    <input
                      type="text" required value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none text-sm`}
                      placeholder={language === 'ar' ? 'مدينتي' : 'Madinaty'}
                    />
                  </div>
                </div>
              </div>

              {/* Developer */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#16100A]">{t('properties:properties.developer')} *</label>
                <div className="relative">
                  <User className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAAAAA]`} />
                  <select
                    required value={formData.developer}
                    onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                    className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border border-[#E5E5E5] rounded-lg outline-none focus:ring-2 focus:ring-[#B5752A] text-sm appearance-none bg-white`}
                  >
                    <option value="">{t('developers:developers.selectDeveloper')}</option>
                    {(developersData?.data || developersData || []).map((dev: any) => (
                      <option key={dev._id} value={dev._id}>
                        {language === 'ar' ? dev.nameAr : dev.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Start Date & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[#16100A]">{t('projects.startDate')} *</label>
                  <div className="relative">
                    <Calendar className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAAAAA]`} />
                    <input
                      type="date" required value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none text-sm`}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[#16100A]">{t('properties:properties.status')} *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#E5E5E5] rounded-lg outline-none focus:ring-2 focus:ring-[#B5752A] text-sm bg-white"
                  >
                    <option value="Active">{t('projects.active')}</option>
                    <option value="Inactive">{t('projects.inactive')}</option>
                    <option value="Sold Out">{t('projects.soldOut')}</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#16100A]">{t('common:common.description')}</label>
                <div className="relative">
                  <FileText className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 w-4 h-4 text-[#AAAAAA]`} />
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border border-[#E5E5E5] rounded-lg outline-none focus:ring-2 focus:ring-[#B5752A] min-h-[100px] text-sm`}
                    placeholder={language === 'ar' ? 'وصف المشروع...' : 'Project description...'}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className={`flex items-center gap-3 pt-4 border-t border-[#E5E5E5] ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button
                  type="submit"
                  disabled={createProject.isPending || updateProject.isPending}
                  className="flex-1 gradient-primary text-white py-2.5 rounded-lg font-medium disabled:opacity-50 transition-all hover:opacity-90"
                >
                  {(createProject.isPending || updateProject.isPending) ? '...' : isEditing ? t('common:common.update') : t('common:common.save')}
                </button>
                <button
                  type="button" onClick={closeModal}
                  className="flex-1 bg-[#F7F7F7] text-[#555555] py-2.5 rounded-lg font-medium hover:bg-[#E5E5E5] transition-all"
                >
                  {t('common:common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}