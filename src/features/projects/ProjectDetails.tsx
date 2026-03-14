import React, { useState, useRef } from 'react';
import {
  ArrowLeft, MapPin, Building, Calendar, TrendingUp, Home,
  Edit2, ChevronRight, Trash2, X, User, FileText, Search,
  Bed, Bath, Maximize2, ChevronLeft, Upload
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../store/useConfigStore';
import { useNavigate, useParams } from 'react-router';
import { useProjectById } from './hooks/useProjectById';
import { useProjectsSummary } from './hooks/useProjectSummary';
import { useUpdateProject } from './hooks/useUpdateProject';
import { useDeleteProject } from './hooks/useDeleteProject';
import { useToastStore } from '../../store/useToastStore';
import { useDevelopers } from '../developers/hooks/useDevelopers';
import { ImageWithFallback } from './components/ImageWithFallback';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['projects', 'common', 'properties']);
  const { dir } = useConfigStore();
  const { triggerToast } = useToastStore();
  const isRTL = dir === 'rtl';
  const language = i18n.language;

  const { data: projectData, isLoading } = useProjectById(id);
  const deleteProject = useDeleteProject();
  const updateProject = useUpdateProject();
  const { data: developersData } = useDevelopers();
  const developers = Array.isArray(developersData?.data) ? developersData.data : Array.isArray(developersData) ? developersData : [];

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  // ─── Image Upload ─────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = 5 - imagePreviews.filter(p => p.startsWith('http')).length - imageFiles.length;
    const toAdd = files.slice(0, Math.max(0, remaining));
    if (!toAdd.length) return;
    setImageFiles(prev => [...prev, ...toAdd]);
    toAdd.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B5752A]" />
      </div>
    );
  }

  const project = projectData; // select في الـ hook بيعمل unwrap تلقائياً

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-[#555555]">{language === 'ar' ? 'لم يتم العثور على المشروع' : 'Project not found'}</p>
      </div>
    );
  }

  const developerName = typeof project.developer === 'object'
    ? project.developer?.name || ''
    : project.developer || '';

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':    return { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  label: t('projects.active') };
      case 'completed': return { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   label: t('projects.completed') };
      case 'upcoming':  return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', label: t('projects.upcoming') };
      case 'inactive':  return { bg: 'bg-gray-50',   text: 'text-gray-500',   border: 'border-gray-200',   label: t('projects.inactive') };
      case 'sold out':  return { bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200',    label: t('projects.soldOut') };
      default:          return { bg: 'bg-gray-50',   text: 'text-gray-700',   border: 'border-gray-200',   label: status };
    }
  };

  const statusConfig = getStatusConfig(project.status);

  const openEdit = () => {
    setFormData({
      name:        project.name        || '',
      description: project.description || '',
      location:    project.location    || '',
      area:        project.area        || '',
      developer:   project.developer?._id || (typeof project.developer === 'string' ? project.developer : '') || '',
      startDate:   project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      status:      project.status      || 'Active',
    });
    setImageFiles([]);
    setImagePreviews(project.images || (project.image ? [project.image] : []));
    setShowEditModal(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) {
        if (k === 'startDate') {
          data.append(k, new Date(v as string).toISOString());
        } else {
          data.append(k, v as string);
        }
      }
    });
    if (imageFiles.length > 0) {
      imageFiles.forEach(file => data.append('images', file));
    }
    updateProject.mutate({ id: id!, data }, {
      onSuccess: () => {
        triggerToast(language === 'ar' ? 'تم تحديث المشروع ✅' : 'Project updated ✅', 'success');
        setShowEditModal(false);
        setImageFiles([]);
        setImagePreviews([]);
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message;
        triggerToast(Array.isArray(msg) ? msg[0] : msg || 'Failed', 'error');
      },
    });
  };

  const handleDelete = () => {
    deleteProject.mutate(id!, {
      onSuccess: () => {
        triggerToast(language === 'ar' ? 'تم حذف المشروع 🗑️' : 'Project deleted 🗑️', 'success');
        navigate('/projects');
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message;
        triggerToast(Array.isArray(msg) ? msg[0] : msg || 'Failed', 'error');
      },
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-[#FAFAFA]" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E5] sticky top-0 z-10">
        <div className="p-6">
          <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={() => navigate(-1)}
              className={`flex items-center gap-2 text-[#555555] hover:text-[#B5752A] transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              {isRTL ? <ChevronRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
              <span className="font-medium">{t('projects.backToList')}</span>
            </button>
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={openEdit}
                className="flex items-center gap-2 px-4 py-2 bg-[#F7F7F7] hover:bg-[#E5E5E5] rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4 text-[#555555]" />
                <span className="text-[#555555] font-medium">{t('common:common.edit')}</span>
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5 text-red-600" />
              </button>
            </div>
          </div>

          <div className={isRTL ? 'text-right' : 'text-left'}>
            <div className={`flex items-center gap-3 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <h1 className="text-3xl font-bold text-[#16100A]">{project.name}</h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                {statusConfig.label}
              </span>
            </div>
            <div className={`flex items-center gap-4 text-[#555555] ${isRTL ? 'flex-row-reverse' : ''}`}>
              {project.location && (
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <MapPin className="w-4 h-4" />
                  <span>{project.location}</span>
                </div>
              )}
              {developerName && (
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Building className="w-4 h-4" />
                  <span>{developerName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Image */}
            <div className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden">
              <ImageWithFallback
                src={project.images?.[0]}
                alt={project.name}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
              <h2 className={`text-xl font-bold text-[#16100A] mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('common:common.description')}
              </h2>
              <p className={`text-[#555555] leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
                {project.description || (language === 'ar' ? 'لا يوجد وصف' : 'No description available')}
              </p>
            </div>

            {/* Units from summary */}
            <ProjectUnitsSummary projectId={id!} isRTL={isRTL} language={language} t={t} navigate={navigate} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
              <h3 className={`font-semibold text-[#16100A] mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('projects.projectInfo')}
              </h3>
              <div className="space-y-4">
                {project.startDate && (
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <Calendar className="w-5 h-5 text-[#B5752A] flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-[#555555] mb-1">{t('projects.startDate')}</p>
                      <p className="font-medium text-[#16100A]" dir="ltr">
                        {new Date(project.startDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )}
                {project.area && (
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <MapPin className="w-5 h-5 text-[#B5752A] flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-[#555555] mb-1">{t('common:common.area')}</p>
                      <p className="font-medium text-[#16100A]">{project.area}</p>
                    </div>
                  </div>
                )}
                {developerName && (
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <Building className="w-5 h-5 text-[#B5752A] flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-[#555555] mb-1">{t('properties:properties.developer')}</p>
                      <p className="font-medium text-[#16100A]">{developerName}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats from summary */}
            <ProjectQuickStats projectId={id!} isRTL={isRTL} language={language} t={t} />

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
              <h3 className={`font-semibold text-[#16100A] mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('projects.quickActions')}
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate(`/properties?project=${id}`)}
                  className="w-full py-3 px-4 bg-[#F7F7F7] hover:bg-[#E5E5E5] rounded-lg transition-colors text-[#16100A] font-medium"
                >
                  {t('projects.viewAllUnits')}
                </button>
                <button
                  onClick={openEdit}
                  className="w-full py-3 px-4 bg-[#F7F7F7] hover:bg-[#E5E5E5] rounded-lg transition-colors text-[#16100A] font-medium"
                >
                  {t('common:common.edit')}
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-red-600 font-medium"
                >
                  {t('common:common.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      {showEditModal && formData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className={`px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <h2 className="text-xl font-bold text-[#16100A]">{t('projects.editProject')}</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-[#555555]" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="px-6 py-4 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">

              {/* Images */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#16100A] flex items-center gap-2 flex-wrap">
                  {language === 'ar' ? 'صور المشروع' : 'Project Images'}
                  <span className="text-xs font-normal text-orange-500">
                    {language === 'ar' ? '⚠️ رفع صور جديدة سيحذف القديمة' : '⚠️ Uploading new images will replace existing ones'}
                  </span>
                </label>
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mb-2">
                    {imagePreviews.map((src, idx) => (
                      <div key={idx} className="relative group">
                        <img src={src} alt={`img-${idx}`} className="w-full h-16 object-cover rounded-lg border border-[#E5E5E5]" />
                        <button type="button"
                          onClick={() => {
                            setImagePreviews(prev => prev.filter((_, i) => i !== idx));
                            if (!src.startsWith('http')) {
                              setImageFiles(prev => {
                                const newFileIdx = imagePreviews.filter((p, pi) => pi < idx && !p.startsWith('http')).length;
                                return prev.filter((_, i) => i !== newFileIdx);
                              });
                            }
                          }}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
                {imagePreviews.length < 5 && (
                  <div onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer border-2 border-dashed border-[#E5E5E5] rounded-xl h-24 flex flex-col items-center justify-center gap-1 text-[#AAAAAA] hover:border-[#B5752A] transition-colors"
                  >
                    <Upload className="w-7 h-7" />
                    <p className="text-xs">
                      {language === 'ar' ? `أضف صورة (${imagePreviews.length}/5)` : `Add image (${imagePreviews.length}/5)`}
                    </p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                  multiple onChange={handleImageChange} className="hidden" />
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#16100A]">{t('projects.projectName')} *</label>
                <div className="relative">
                  <Building className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAAAAA]`} />
                  <input type="text" required value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none text-sm`}
                  />
                </div>
              </div>

              {/* Location & Area */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[#16100A]">{t('common:common.location')} *</label>
                  <div className="relative">
                    <MapPin className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAAAAA]`} />
                    <input type="text" required value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none text-sm`}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[#16100A]">{t('common:common.area')} *</label>
                  <div className="relative">
                    <MapPin className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAAAAA]`} />
                    <input type="text" required value={formData.area}
                      onChange={e => setFormData({ ...formData, area: e.target.value })}
                      className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none text-sm`}
                    />
                  </div>
                </div>
              </div>

              {/* Developer */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#16100A]">{t('properties:properties.developer')} *</label>
                <div className="relative">
                  <User className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAAAAA]`} />
                  <select required value={formData.developer}
                    onChange={e => setFormData({ ...formData, developer: e.target.value })}
                    className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border border-[#E5E5E5] rounded-lg outline-none focus:ring-2 focus:ring-[#B5752A] text-sm appearance-none bg-white`}
                  >
                    <option value="">{language === 'ar' ? 'اختر مطور...' : 'Select developer...'}</option>
                    {developers.map((dev: any) => (
                      <option key={dev._id} value={dev._id}>
                        {language === 'ar' ? dev.nameAr || dev.name : dev.name}
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
                    <input type="date" required value={formData.startDate}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                      className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none text-sm`}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[#16100A]">{t('properties:properties.status')} *</label>
                  <select value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#E5E5E5] rounded-lg outline-none focus:ring-2 focus:ring-[#B5752A] text-sm bg-white"
                  >
                    <option value="Active">{t('projects.active')}</option>
                    <option value="Inactive">{t('projects.inactive')}</option>
                    <option value="Sold Out">{t('projects.soldOut')}</option>
                    <option value="Completed">{t('projects.completed')}</option>
                    <option value="Upcoming">{t('projects.upcoming')}</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#16100A]">{t('common:common.description')}</label>
                <div className="relative">
                  <FileText className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 w-4 h-4 text-[#AAAAAA]`} />
                  <textarea value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 border border-[#E5E5E5] rounded-lg outline-none focus:ring-2 focus:ring-[#B5752A] min-h-[100px] text-sm`}
                    placeholder={language === 'ar' ? 'وصف المشروع...' : 'Project description...'}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className={`flex items-center gap-3 pt-4 border-t border-[#E5E5E5] ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button type="submit" disabled={updateProject.isPending}
                  className="flex-1 gradient-primary text-white py-2.5 rounded-lg font-medium disabled:opacity-50 transition-all hover:opacity-90"
                >
                  {updateProject.isPending ? '...' : t('common:common.update')}
                </button>
                <button type="button" onClick={() => { setShowEditModal(false); setImageFiles([]); setImagePreviews([]); }}
                  className="flex-1 bg-[#F7F7F7] text-[#555555] py-2.5 rounded-lg font-medium hover:bg-[#E5E5E5] transition-all"
                >
                  {t('common:common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-[#16100A] mb-2">{t('common:common.confirmDelete')}</h3>
              <p className="text-[#555555] mb-6">
                {language === 'ar'
                  ? `هل أنت متأكد من حذف "${project.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`
                  : `Are you sure you want to delete "${project.name}"? This cannot be undone.`}
              </p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-[#E5E5E5] rounded-lg text-[#555555] hover:bg-[#F7F7F7] font-medium"
                >
                  {t('common:common.cancel')}
                </button>
                <button onClick={handleDelete} disabled={deleteProject.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold disabled:opacity-50"
                >
                  {deleteProject.isPending ? '...' : t('common:common.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components using summary API ──────────────────────────────────────────

function ProjectUnitsSummary({ projectId, isRTL, language, t, navigate }: any) {
  const results = useProjectsSummary([{ _id: projectId }]);
  const summary = results[0]?.data?.data || results[0]?.data;
  const totalUnits     = summary?.totalUnits     || 0;
  const soldUnits      = summary?.soldUnits      || 0;
  const availableUnits = summary?.availableUnits || 0;
  const salesPct = totalUnits > 0 ? Math.round((soldUnits / totalUnits) * 100) : 0;

  return (
    <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
      <h2 className={`text-xl font-bold text-[#16100A] mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
        {t('projects.salesProgress')}
      </h2>
      <div className="space-y-4">
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-[#555555]">{t('projects.progress')}</span>
          <span className="text-2xl font-bold text-[#B5752A]">{salesPct}%</span>
        </div>
        <div className="w-full bg-[#E5E5E5] rounded-full h-4 overflow-hidden">
          <div className="h-full gradient-primary rounded-full transition-all duration-500" style={{ width: `${salesPct}%` }} />
        </div>
        <div className={`grid grid-cols-3 gap-4 pt-4 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className="bg-[#FAFAFA] p-4 rounded-lg">
            <p className="text-xs text-[#555555] mb-1">{t('projects.totalUnits')}</p>
            <p className="text-2xl font-bold text-[#16100A]">{totalUnits}</p>
          </div>
          <div className="bg-[#FAFAFA] p-4 rounded-lg">
            <p className="text-xs text-[#555555] mb-1">{t('projects.soldUnits')}</p>
            <p className="text-2xl font-bold text-green-600">{soldUnits}</p>
          </div>
          <div className="bg-[#FAFAFA] p-4 rounded-lg">
            <p className="text-xs text-[#555555] mb-1">{t('projects.availableUnits')}</p>
            <p className="text-2xl font-bold text-blue-600">{availableUnits}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectQuickStats({ projectId, isRTL, language, t }: any) {
  const results = useProjectsSummary([{ _id: projectId }]);
  const summary = results[0]?.data?.data || results[0]?.data;
  const totalUnits  = summary?.totalUnits  || 0;
  const soldUnits   = summary?.soldUnits   || 0;
  const salesPct = totalUnits > 0 ? Math.round((soldUnits / totalUnits) * 100) : 0;

  return (
    <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
      <h3 className={`font-semibold text-[#16100A] mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
        {t('projects.quickStats')}
      </h3>
      <div className="space-y-3">
        <div className={`p-4 bg-gradient-to-br from-[#FEF3E2] to-[#FCF8E8] rounded-lg ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Home className="w-5 h-5 text-[#B5752A]" />
            <p className="text-sm text-[#555555]">{t('projects.completion')}</p>
          </div>
          <p className="text-3xl font-bold text-[#B5752A]">{salesPct}%</p>
        </div>
        <div className={`p-4 bg-gradient-to-br from-[#FEF3E2] to-[#FCF8E8] rounded-lg ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <TrendingUp className="w-5 h-5 text-[#B5752A]" />
            <p className="text-sm text-[#555555]">{t('projects.totalUnits')}</p>
          </div>
          <p className="text-2xl font-bold text-[#B5752A]">{totalUnits.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}