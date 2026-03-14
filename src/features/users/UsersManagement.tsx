import React, { useState, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, Shield, UserCheck, TrendingUp, X, Camera, Upload, ChevronLeft, ChevronRight, AlertTriangle, UserX, UserCheck2, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../store/useConfigStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useCreateUser } from './hooks/useCreateUser';
import { z } from 'zod';
import { useUsers } from './hooks/useUsers';
import { useUpdateUser } from './hooks/useUpdateUser';
import { useDeactivateUser } from './hooks/useDeactivateUser';
import { useDeleteUserPermanently } from './hooks/useDeleteUserPermanently';
import { useQueryClient } from '@tanstack/react-query';
import { useToastStore } from '../../store/useToastStore';

// ── Zod Schema ────────────────────────────────────────────────────────────────
const userSchema = z.object({
  fullName: z.string().min(6, 'Full name must be at least 6 characters').nonempty('Full name is required'),
  email: z.string().email('Invalid email address').nonempty('Email is required'),
  password: z.string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || val.length >= 8, { message: 'Password must be at least 8 characters' })
    .refine((val) => {
      if (!val) return true;
      return /[A-Z]/.test(val) && /[a-z]/.test(val) && /[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val);
    }, 'Must contain uppercase, lowercase, number and special character'),
  role: z.enum(['admin', 'sales', 'user', 'super_admin']),
  phone: z.string().nonempty('Phone number is required').refine((val) => {
    return /^01[0125]\d{8}$/.test(val) || /^05\d{8}$/.test(val) || /^(\+20|\+966)\d{9,10}$/.test(val);
  }, 'Please enter a valid local number (e.g., 01xxxx or 05xxxx)'),
});

const formatPhoneForBackend = (input: string) => {
  const cleaned = input.replace(/\D/g, '');
  if (cleaned.startsWith('01') && cleaned.length === 11) return `+20${cleaned.substring(1)}`;
  if (cleaned.startsWith('05') && cleaned.length === 10) return `+966${cleaned.substring(1)}`;
  return input.startsWith('+') ? input : `+${input}`;
};

// ── Initial form state ────────────────────────────────────────────────────────
const emptyForm = {
  nameEnglish: '',
  email: '',
  phone: '',
  role: 'sales' as 'admin' | 'sales' | 'user' | 'super_admin',
  status: 'active' as 'active' | 'inactive',
  password: '',
  confirmPassword: '',
};

export default function UsersManagement() {
  const { t, i18n } = useTranslation(['users', 'roles', 'common']);
  const { dir } = useConfigStore();
  const { user: currentUser } = useAuthStore();
  const { triggerToast } = useToastStore();
  const isRTL = dir === 'rtl';
  const language = i18n.language;

  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfig, setDeleteConfig] = useState<{
    isOpen: boolean;
    id: string;
    name: string;
    action: 'activate' | 'deactivate' | 'delete';
  }>({ isOpen: false, id: '', name: '', action: 'delete' });
  const [searchTerm, setSearchTerm]   = useState('');
  const [filterRole, setFilterRole]   = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');
  const avatarFileRef = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData]       = useState({ ...emptyForm });
  const [showPassword, setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const createUser             = useCreateUser();
  const deactivateUserMutation = useDeactivateUser();
  const deletePermanentlyMutation = useDeleteUserPermanently();
  const updateUserMutation     = useUpdateUser();
  const queryClient            = useQueryClient();

  const { data: backendUsers, isLoading } = useUsers(currentPage);
  const usersList  = backendUsers?.data ?? [];
  const totalPages = backendUsers?.pagination?.numberOfPages ?? 1;

  const filteredUsers = usersList.filter((u: any) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const matchesRole   = filterRole === 'all' || u.role === filterRole;
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' ? u.isActive === true : u.isActive === false);
    return matchesSearch && matchesRole && matchesStatus;
  });

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return t('roles:roles.superAdmin');
      case 'admin':       return t('roles:roles.admin');
      case 'sales':       return t('roles:roles.sales');
      default:            return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-[#FEF3E2] text-[#B5752A] border-[#B5752A]';
      case 'admin':       return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'sales':       return 'bg-blue-50 text-blue-700 border-blue-200';
      default:            return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <Shield className="w-4 h-4" />;
      case 'admin':       return <UserCheck className="w-4 h-4" />;
      case 'sales':       return <TrendingUp className="w-4 h-4" />;
      default:            return null;
    }
  };

  const resetForm = () => {
    setFormData({ ...emptyForm });
    setEditingUser(null);
    setAvatarPreview('');
    avatarFileRef.current = null;
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      triggerToast('يُسمح فقط بصور PNG, JPEG, WEBP', 'error');
      return;
    }
    avatarFileRef.current = file;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const openAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = (userData: any) => {
    setEditingUser(userData);
    setFormData({
      nameEnglish:     userData.fullName || '',
      email:           userData.email    || '',
      phone:           userData.phone    || '',
      role:            userData.role     || 'sales',
      status:          userData.isActive ? 'active' : 'inactive',
      password:        '',
      confirmPassword: '',
    });
    setAvatarPreview(userData.images?.[0] || '');
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nameEnglish || formData.nameEnglish.length < 3) {
      triggerToast('الاسم يجب أن يكون 3 أحرف على الأقل', 'error'); return;
    }
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      triggerToast('البريد الإلكتروني غير صالح', 'error'); return;
    }
    if (!formData.phone) {
      triggerToast('رقم الهاتف مطلوب', 'error'); return;
    }
    if (!editingUser) {
      if (!formData.password || formData.password.length < 8) {
        triggerToast('كلمة المرور يجب أن تكون 8 أحرف على الأقل', 'error'); return;
      }
      if (formData.password !== formData.confirmPassword) {
        triggerToast('كلمات المرور غير متطابقة', 'error'); return;
      }
    }

    const fd = new FormData();
    fd.append('fullName',  formData.nameEnglish);
    fd.append('email',     formData.email);
    fd.append('phone',     formatPhoneForBackend(formData.phone));
    fd.append('role',      formData.role);
    if (editingUser) fd.append('isActive', String(formData.status === 'active'));
    if (!editingUser) fd.append('password', formData.password);

    const fileFromInput = fileInputRef.current?.files?.[0];
    if (fileFromInput) fd.append('images', fileFromInput);

    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser._id || editingUser.id, data: fd }, {
        onSuccess: () => {
          triggerToast(language === 'ar' ? 'تم تحديث المستخدم ✅' : 'User updated ✅', 'success');
          handleClose();
          queryClient.invalidateQueries({ queryKey: ['users-all'] });
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message;
          triggerToast(Array.isArray(msg) ? msg[0] : msg || 'Failed', 'error');
        },
      });
    } else {
      createUser.mutate(fd, {
        onSuccess: () => {
          triggerToast(language === 'ar' ? 'تم إضافة المستخدم 🎉' : 'User added 🎉', 'success');
          handleClose();
          queryClient.invalidateQueries({ queryKey: ['users-all'] });
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message;
          triggerToast(Array.isArray(msg) ? msg[0] : msg || 'Failed', 'error');
        },
      });
    }
  };

  // ── Toggle activate / deactivate ─────────────────────────────────────────────
  const handleToggleStatus = (id: string, name: string, isActive: boolean) => {
    setDeleteConfig({ isOpen: true, id, name, action: isActive ? 'deactivate' : 'activate' });
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteConfig({ isOpen: true, id, name, action: 'delete' });
  };

  const confirmAction = () => {
    if (deleteConfig.action === 'delete') {
      deletePermanentlyMutation.mutate(deleteConfig.id, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['users-all'] });
          triggerToast(language === 'ar' ? 'تم حذف المستخدم نهائياً 🗑️' : 'User deleted permanently 🗑️', 'success');
          setDeleteConfig({ isOpen: false, id: '', name: '', action: 'delete' });
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message;
          triggerToast(Array.isArray(msg) ? msg[0] : msg || 'Failed', 'error');
        },
      });
    } else {
      // activate OR deactivate → same mutation (toggles isActive on backend)
      deactivateUserMutation.mutate(deleteConfig.id, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['users-all'] });
          const msg = deleteConfig.action === 'deactivate'
            ? (language === 'ar' ? 'تم تعطيل المستخدم ✅' : 'User deactivated ✅')
            : (language === 'ar' ? 'تم تفعيل المستخدم ✅' : 'User activated ✅');
          triggerToast(msg, 'success');
          setDeleteConfig({ isOpen: false, id: '', name: '', action: 'delete' });
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message;
          triggerToast(Array.isArray(msg) ? msg[0] : msg || 'Failed', 'error');
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B5752A]" />
      </div>
    );
  }

  // ── Modal ────────────────────────────────────────────────────────────────────
  const renderModal = () => (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E5E5E5] p-6 flex items-center justify-between">
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h2 className="text-2xl font-bold text-[#16100A] mb-1">
              {editingUser
                ? (language === 'ar' ? 'تعديل المستخدم' : 'Edit User')
                : (language === 'ar' ? 'إضافة مستخدم جديد' : 'Add New User')}
            </h2>
            <p className="text-sm text-[#555555]">
              {language === 'ar' ? 'أدخل بيانات المستخدم' : 'Fill in user details'}
            </p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#555555]" />
          </button>
        </div>

        {/* Body */}
        <form className="p-6" onSubmit={handleSubmit}>
          {/* Profile Picture */}
          <div className="mb-6">
            <label className={`block text-sm font-semibold text-[#16100A] mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
              {language === 'ar' ? 'صورة الملف الشخصي' : 'Profile Picture'}
            </label>
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="relative">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-2 border-[#E5E5E5]" />
                ) : (
                  <div className="w-24 h-24 gradient-primary rounded-full flex items-center justify-center text-white text-3xl font-semibold">
                    {formData.nameEnglish.charAt(0) || '?'}
                  </div>
                )}
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-white border-2 border-[#E5E5E5] rounded-full p-2 hover:bg-[#F7F7F7] transition-colors"
                >
                  <Camera className="w-4 h-4 text-[#B5752A]" />
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarChange} className="hidden" />
              <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center gap-2 px-4 py-2 border border-[#E5E5E5] rounded-lg hover:bg-[#F7F7F7] transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <Upload className="w-4 h-4 text-[#555555]" />
                  <span className="text-sm text-[#555555]">{language === 'ar' ? 'رفع صورة' : 'Upload Photo'}</span>
                </button>
                {avatarPreview && (
                  <button type="button" onClick={() => { setAvatarPreview(''); avatarFileRef.current = null; }}
                    className="text-sm text-red-600 hover:text-red-700 mt-2 block"
                  >
                    {language === 'ar' ? 'إزالة الصورة' : 'Remove Photo'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className={`block text-sm font-semibold text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'الاسم الكامل' : 'Full Name'} <span className="text-red-500">*</span>
              </label>
              <input type="text" dir="ltr" value={formData.nameEnglish}
                onChange={e => setFormData({ ...formData, nameEnglish: e.target.value })}
                placeholder="Ahmed Hassan"
                className="w-full px-4 py-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className={`block text-sm font-semibold text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'} <span className="text-red-500">*</span>
              </label>
              <input type="email" dir="ltr" value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@locationproperties.com"
                className="w-full px-4 py-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] transition-all"
              />
            </div>

            {/* Phone */}
            <div>
              <label className={`block text-sm font-semibold text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'} <span className="text-red-500">*</span>
              </label>
              <input type="tel" dir="ltr" value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+20 100 123 4567"
                className="w-full px-4 py-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] transition-all"
              />
            </div>

            {/* Role */}
            <div>
              <label className={`block text-sm font-semibold text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('common:common.role')} <span className="text-red-500">*</span>
              </label>
              <select value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                className={`w-full px-4 py-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] transition-all bg-white ${isRTL ? 'text-right' : 'text-left'}`}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <option value="sales">{t('roles:roles.sales')}</option>
                <option value="admin">{t('roles:roles.admin')}</option>
                <option value="super_admin">{t('roles:roles.superAdmin')}</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className={`block text-sm font-semibold text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('common:common.status')} <span className="text-red-500">*</span>
              </label>
              <select value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className={`w-full px-4 py-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] transition-all bg-white ${isRTL ? 'text-right' : 'text-left'}`}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <option value="active">{language === 'ar' ? 'نشط' : 'Active'}</option>
                <option value="inactive">{language === 'ar' ? 'غير نشط' : 'Inactive'}</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label className={`block text-sm font-semibold text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'كلمة المرور' : 'Password'} {!editingUser && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] transition-all ${isRTL ? 'pl-10' : 'pr-10'}`}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} text-[#555555] hover:text-[#B5752A] transition-colors`}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className={`text-xs text-[#555555] mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                {editingUser
                  ? (language === 'ar' ? 'اتركه فارغاً للإبقاء على كلمة المرور الحالية' : 'Leave blank to keep current password')
                  : (language === 'ar' ? '8 أحرف على الأقل' : 'Minimum 8 characters')}
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className={`block text-sm font-semibold text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'} {!editingUser && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <input type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] transition-all ${isRTL ? 'pl-10' : 'pr-10'}`}
                />
                <button type="button" onClick={() => setShowConfirmPassword(v => !v)}
                  className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} text-[#555555] hover:text-[#B5752A] transition-colors`}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`flex items-center gap-3 mt-8 pt-6 border-t border-[#E5E5E5] ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button type="button" onClick={handleClose}
              className="flex-1 px-6 py-3 border border-[#E5E5E5] text-[#555555] rounded-lg hover:bg-[#F7F7F7] transition-colors font-medium"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button type="submit"
              disabled={createUser.isPending || updateUserMutation.isPending}
              className="flex-1 px-6 py-3 gradient-primary text-white rounded-lg hover:opacity-90 transition-all font-medium shadow-lg disabled:opacity-50"
            >
              {(createUser.isPending || updateUserMutation.isPending)
                ? '...'
                : editingUser
                  ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes')
                  : (language === 'ar' ? 'إضافة المستخدم' : 'Add User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h1 className="text-2xl font-bold text-[#16100A] mb-2">{t('users.management')}</h1>
            <p className="text-[#555555]">{t('users.managementSubtitle')}</p>
          </div>
          <button
            onClick={openAdd}
            disabled={currentUser?.role !== 'super_admin' && currentUser?.role !== 'admin'}
            className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            {t('users.addUser')}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]`} />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder={t('users.searchPlaceholder')}
              className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'} py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`}
            />
          </div>
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
            className={`px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] ${isRTL ? 'text-right' : ''}`}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <option value="all">{t('users.allRoles')}</option>
            <option value="super_admin">{t('roles:roles.superAdmin')}</option>
            <option value="admin">{t('roles:roles.admin')}</option>
            <option value="sales">{t('roles:roles.sales')}</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className={`px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] ${isRTL ? 'text-right' : ''}`}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <option value="all">{t('users.allStatus')}</option>
            <option value="active">{language === 'ar' ? 'نشط' : 'Active'}</option>
            <option value="inactive">{language === 'ar' ? 'غير نشط' : 'Inactive'}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            <thead className="bg-[#F7F7F7] border-b border-[#E5E5E5]">
              <tr>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-sm font-semibold text-[#16100A]`}>{t('users.user')}</th>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-sm font-semibold text-[#16100A]`}>{t('common:common.role')}</th>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-sm font-semibold text-[#16100A]`}>{t('users.contact')}</th>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-sm font-semibold text-[#16100A]`}>{t('common:common.status')}</th>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-sm font-semibold text-[#16100A]`}>{t('users.joinedDate')}</th>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-sm font-semibold text-[#16100A]`}>{t('users.performance')}</th>
                <th className={`px-6 py-3 ${isRTL ? 'text-left' : 'text-right'} text-sm font-semibold text-[#16100A]`}>{t('common:common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {filteredUsers.map((userData: any) => (
                <tr key={userData._id || userData.id} className="hover:bg-[#FAFAFA]">
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {userData.images?.[0] ? (
                        <img src={userData.images[0]} alt={userData.fullName} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {userData.fullName?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <p className="font-medium text-[#16100A]">{userData.fullName}</p>
                        <p className="text-sm text-[#555555]" dir="ltr">{userData.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getRoleBadgeColor(userData.role)}`}>
                      {getRoleIcon(userData.role)}
                      {getRoleLabel(userData.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#555555]" dir="ltr">{userData.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${userData.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                      {userData.isActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#555555]" dir="ltr">
                      {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : '---'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {userData.performance ? (
                      <div className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                        <p className="font-medium text-[#16100A]">{userData.performance.sales} {t('users.sales')}</p>
                        <p className="text-[#555555]" dir="ltr">{(userData.performance.revenue / 1000000).toFixed(1)}M EGP</p>
                      </div>
                    ) : <span className="text-sm text-[#555555]">-</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-2 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                      {/* Edit */}
                      <button
                        onClick={() => openEdit(userData)}
                        className="p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors"
                        title={language === 'ar' ? 'تعديل' : 'Edit'}
                      >
                        <Edit2 className="w-4 h-4 text-[#555555]" />
                      </button>

                      {/* Toggle: Deactivate if active, Activate if inactive */}
                      <button
                        onClick={() => handleToggleStatus(userData._id || userData.id, userData.fullName, userData.isActive)}
                        className={`p-2 rounded-lg transition-colors ${
                          userData.isActive ? 'hover:bg-orange-50' : 'hover:bg-green-50'
                        }`}
                        title={
                          userData.isActive
                            ? (language === 'ar' ? 'تعطيل' : 'Deactivate')
                            : (language === 'ar' ? 'تفعيل' : 'Activate')
                        }
                      >
                        {userData.isActive
                          ? <UserX className="w-4 h-4 text-orange-500" />
                          : <UserCheck2 className="w-4 h-4 text-green-600" />
                        }
                      </button>

                      {/* Delete permanently */}
                      <button
                        onClick={() => handleDelete(userData._id || userData.id, userData.fullName)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title={language === 'ar' ? 'حذف نهائي' : 'Delete permanently'}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className={`flex items-center justify-center gap-2 mt-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1 || isLoading}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E5E5] hover:bg-[#F7F7F7] disabled:opacity-40 transition-colors"
          >
            {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
            if (page !== 1 && page !== totalPages && Math.abs(page - currentPage) > 1) {
              if (page === 2 || page === totalPages - 1) return <span key={page} className="text-[#555555] text-sm px-1">...</span>;
              return null;
            }
            return (
              <button key={page} onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === currentPage ? 'gradient-primary text-white' : 'border border-[#E5E5E5] text-[#555555] hover:bg-[#F7F7F7]'}`}
              >
                {page}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || isLoading}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E5E5] hover:bg-[#F7F7F7] disabled:opacity-40 transition-colors"
          >
            {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <span className="text-xs text-[#555555] mx-2">
            {language === 'ar' ? `صفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
          </span>
        </div>
      )}

      {/* ── Confirm Modal ── */}
      {deleteConfig.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                deleteConfig.action === 'activate'   ? 'bg-green-50'  :
                deleteConfig.action === 'deactivate' ? 'bg-orange-50' : 'bg-red-50'
              }`}>
                {deleteConfig.action === 'activate'
                  ? <UserCheck2 className="w-8 h-8 text-green-600" />
                  : deleteConfig.action === 'deactivate'
                    ? <UserX className="w-8 h-8 text-orange-500" />
                    : <AlertTriangle className="w-8 h-8 text-red-600" />
                }
              </div>

              <h3 className="text-xl font-bold text-[#16100A] mb-2">
                {deleteConfig.action === 'activate'
                  ? (language === 'ar' ? 'تأكيد التفعيل' : 'Confirm Activation')
                  : deleteConfig.action === 'deactivate'
                    ? (language === 'ar' ? 'تأكيد التعطيل' : 'Confirm Deactivation')
                    : (language === 'ar' ? 'تأكيد الحذف النهائي' : 'Confirm Permanent Delete')}
              </h3>

              <p className="text-[#555555] mb-6">
                {deleteConfig.action === 'activate'
                  ? (language === 'ar'
                      ? `هل تريد تفعيل "${deleteConfig.name}"؟`
                      : `Activate "${deleteConfig.name}"?`)
                  : deleteConfig.action === 'deactivate'
                    ? (language === 'ar'
                        ? `هل تريد تعطيل "${deleteConfig.name}"؟ يمكن إعادة تفعيله لاحقاً.`
                        : `Deactivate "${deleteConfig.name}"? They can be reactivated later.`)
                    : (language === 'ar'
                        ? `هل أنت متأكد من حذف "${deleteConfig.name}" نهائياً؟ لا يمكن التراجع عنه.`
                        : `Permanently delete "${deleteConfig.name}"? This cannot be undone.`)}
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDeleteConfig({ isOpen: false, id: '', name: '', action: 'delete' })}
                  className="flex-1 px-4 py-2 border border-[#E5E5E5] rounded-lg text-[#555555] hover:bg-[#F7F7F7] font-medium"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={confirmAction}
                  disabled={deactivateUserMutation.isPending || deletePermanentlyMutation.isPending}
                  className={`flex-1 px-4 py-2 text-white rounded-lg font-bold disabled:opacity-50 ${
                    deleteConfig.action === 'activate'
                      ? 'bg-green-600 hover:bg-green-700'
                      : deleteConfig.action === 'deactivate'
                        ? 'bg-orange-500 hover:bg-orange-600'
                        : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {(deactivateUserMutation.isPending || deletePermanentlyMutation.isPending)
                    ? '...'
                    : deleteConfig.action === 'activate'
                      ? (language === 'ar' ? 'تفعيل' : 'Activate')
                      : deleteConfig.action === 'deactivate'
                        ? (language === 'ar' ? 'تعطيل' : 'Deactivate')
                        : (language === 'ar' ? 'حذف نهائي' : 'Delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && renderModal()}
    </div>
  );
}