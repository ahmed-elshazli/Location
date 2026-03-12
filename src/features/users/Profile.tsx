import React, { useState, useRef, useEffect } from 'react';
import { Camera, Save, Shield, Mail, Phone, Lock, Bell, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../store/useConfigStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../utils/axios';
import { useGetProfile } from './hooks/useGetProfile';

export default function Profile() {
  const { t, i18n }          = useTranslation(['profile', 'common']);
  const { dir, setLanguage } = useConfigStore();
  const { user, setAuth, token } = useAuthStore();
  const { triggerToast }     = useToastStore();
  const queryClient          = useQueryClient();

  const isRTL    = dir === 'rtl';
  const language = i18n.language;

  const { data: profileData, isLoading: isProfileLoading } = useGetProfile(user?.id || null);
  const profile = profileData?.data || profileData;

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as 'en' | 'ar');
    i18n.changeLanguage(lang);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    email:    '',
    phone:    '',
  });

  const [avatarPreview, setAvatarPreview] = useState<string>('');

  // ✅ sync مرة واحدة بس لما profile يتحمل — ref يمنع التكرار
  const profileSynced = useRef(false);
  useEffect(() => {
    if (!profile || profileSynced.current) return;
    profileSynced.current = true;
    setPersonalInfo({
      fullName: profile.fullName || profile.name || '',
      email:    profile.email    || '',
      phone:    profile.phone    || '',
    });
    const img = profile.images?.[0] || profile.avatar;
    if (img) setAvatarPreview(img);
  }, [profile]);

  const [passwordData, setPasswordData] = useState({
    currentPassword:    '',
    newPassword:        '',
    confirmNewPassword: '',
  });

  const [preferences, setPreferences] = useState({ emailNotifications: true });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const updateMutation = useMutation({
    mutationFn: (data: FormData) =>
      api.patch(`/api/v1/users/${user?.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(r => r.data),
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      triggerToast(Array.isArray(msg) ? msg[0] : msg || 'حدث خطأ', 'error');
    },
  });

  const formatPhone = (input: string) => {
    const cleaned = input.replace(/\D/g, '');
    if (cleaned.startsWith('01') && cleaned.length === 11) return `+20${cleaned.substring(1)}`;
    if (cleaned.startsWith('05') && cleaned.length === 10) return `+966${cleaned.substring(1)}`;
    return input.startsWith('+') ? input : `+${input}`;
  };

  const handleSaveProfile = () => {
    const payload = new FormData();
    payload.append('fullName', personalInfo.fullName);
    payload.append('email',    personalInfo.email);
    if (personalInfo.phone?.trim()) payload.append('phone', formatPhone(personalInfo.phone.trim()));
    if (pendingImageFile) payload.append('images', pendingImageFile);

    updateMutation.mutate(payload, {
      onSuccess: (res) => {
        triggerToast(language === 'ar' ? 'تم التحديث ✅' : 'Profile updated ✅', 'success');
        const updated = res?.data || res;
        if (updated && token) {
          const newAvatar = updated.images?.[0] || updated.avatar || user?.avatar;
          setAuth(token, {
            id:     user?.id    || '',
            name:   updated.fullName || updated.name || personalInfo.fullName,
            email:  updated.email    || personalInfo.email,
            role:   user?.role  || 'sales',
            avatar: newAvatar,
          });
          if (updated.images?.[0]) setAvatarPreview(updated.images[0]);
        }
        queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      },
    });
  };

  const handleChangePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      triggerToast(language === 'ar' ? 'أدخل كلمة المرور' : 'Enter password fields', 'error');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      triggerToast(language === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match', 'error');
      return;
    }
    const pwPayload = new FormData();
    pwPayload.append('password',        passwordData.newPassword);
    pwPayload.append('currentPassword', passwordData.currentPassword);
    updateMutation.mutate(pwPayload, {
      onSuccess: () => {
        triggerToast(language === 'ar' ? 'تم تغيير كلمة المرور ✅' : 'Password changed ✅', 'success');
        setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      },
    });
  };

  const getRoleBadge = () => {
    const role = profile?.role || user?.role || '';
    const roleColors: Record<string, string> = {
      super_admin: 'bg-[#FEF3E2] text-[#B5752A] border-[#B5752A]',
      admin:       'bg-purple-50 text-purple-700 border-purple-200',
      sales:       'bg-blue-50 text-blue-700 border-blue-200',
    };
    const roleLabels: Record<string, string> = {
      super_admin: language === 'ar' ? 'مدير عام' : 'Super Admin',
      admin:       language === 'ar' ? 'مدير'     : 'Admin',
      sales:       language === 'ar' ? 'مبيعات'   : 'Sales',
    };
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${roleColors[role] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
        <Shield className="w-4 h-4" />
        {roleLabels[role] || role}
      </span>
    );
  };

  if (isProfileLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B5752A]" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#16100A] mb-2">{t('profile.title')}</h1>
        <p className="text-[#555555]">{t('profile.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column */}
        <div className="space-y-6">

          {/* Profile Picture */}
          <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
            <h3 className="font-semibold text-[#16100A] mb-4">
              {language === 'ar' ? 'الصورة الشخصية' : 'Profile Picture'}
            </h3>
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-[#E5E5E5]" />
                ) : (
                  <div className="w-32 h-32 gradient-primary rounded-full flex items-center justify-center text-white text-5xl font-semibold">
                    {(personalInfo.fullName || '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-white border-2 border-[#E5E5E5] rounded-full p-3 hover:bg-[#F7F7F7] transition-colors shadow-lg"
                >
                  <Camera className="w-5 h-5 text-[#B5752A]" />
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="text-sm text-[#B5752A] hover:text-[#8B5A1F] font-medium">
                {language === 'ar' ? 'تغيير الصورة' : 'Change Photo'}
              </button>
              <p className="text-xs text-[#AAAAAA] text-center mt-1">
                {language === 'ar' ? 'معاينة محلية فقط' : 'Local preview only'}
              </p>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
            <h3 className="font-semibold text-[#16100A] mb-4">{t('profile.accountDetails')}</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[#555555] mb-1">{t('common:common.role')}</p>
                {getRoleBadge()}
              </div>
              <div>
                <p className="text-sm text-[#555555] mb-1">{t('profile.lastLogin')}</p>
                <p className="text-sm text-[#16100A]" dir="ltr">
                  {new Date().toLocaleDateString(
                    language === 'ar' ? 'ar-EG' : 'en-US',
                    { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Personal Info */}
          <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
            <h3 className="font-semibold text-[#16100A] mb-4">{t('profile.personalInfo')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#16100A] mb-2">
                  {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <input
                  type="text"
                  value={personalInfo.fullName}
                  onChange={e => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#16100A] mb-2">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <div className="relative">
                  <Mail className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]`} />
                  <input
                    type="email"
                    value={personalInfo.email}
                    dir="ltr"
                    onChange={e => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#16100A] mb-2">
                  {language === 'ar' ? 'رقم الهاتف' : 'Phone'}
                </label>
                <div className="relative">
                  <Phone className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]`} />
                  <input
                    type="tel"
                    value={personalInfo.phone}
                    dir="ltr"
                    placeholder="+201001234567"
                    onChange={e => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`}
                  />
                </div>
              </div>
            </div>
            <div className={`mt-6 flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
              <button
                onClick={handleSaveProfile}
                disabled={updateMutation.isPending}
                className="flex items-center gap-2 gradient-primary text-white px-6 py-3 rounded-lg hover:opacity-90 transition-all shadow-lg disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {updateMutation.isPending ? '...' : (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
              </button>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
            <h3 className="font-semibold text-[#16100A] mb-4">{t('profile.accountSecurity')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#16100A] mb-2">
                  {language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}
                </label>
                <div className="relative">
                  <Lock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]`} />
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    placeholder="••••••••"
                    onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#16100A] mb-2">
                    {language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                  </label>
                  <div className="relative">
                    <Lock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]`} />
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      placeholder="••••••••"
                      onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#16100A] mb-2">
                    {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                  </label>
                  <div className="relative">
                    <Lock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]`} />
                    <input
                      type="password"
                      value={passwordData.confirmNewPassword}
                      placeholder="••••••••"
                      onChange={e => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                      className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`}
                    />
                  </div>
                </div>
              </div>
              <div className={`mt-2 flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
                <button
                  onClick={handleChangePassword}
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2 bg-[#16100A] text-white px-6 py-3 rounded-lg hover:bg-[#2A2015] transition-all disabled:opacity-50"
                >
                  <Lock className="w-5 h-5" />
                  {language === 'ar' ? 'تغيير كلمة المرور' : 'Update Password'}
                </button>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
            <h3 className="font-semibold text-[#16100A] mb-4">{t('profile.preferences')}</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#16100A] mb-2">
                  {language === 'ar' ? 'اللغة' : 'Language'}
                </label>
                <div className="relative">
                  <Globe className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]`} />
                  <select
                    value={language}
                    onChange={e => handleLanguageChange(e.target.value)}
                    className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] bg-white`}
                  >
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-[#555555] mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-[#16100A]">
                      {language === 'ar' ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}
                    </p>
                    <p className="text-sm text-[#555555] mt-1">
                      {language === 'ar' ? 'استقبال تحديثات ورسائل النظام' : 'Receive updates and system messages'}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={preferences.emailNotifications}
                    onChange={e => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#B5752A]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[\'\'] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B5752A]" />
                </label>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}