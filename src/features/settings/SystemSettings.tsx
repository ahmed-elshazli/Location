import React, { useState } from 'react';
import { Save, Plus, Edit2, Trash2, Settings as SettingsIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // ✅ البديل الصحيح للترجمة
import { useConfigStore } from '../../store/useConfigStore'; // ✅ لجلب الاتجاه (RTL/LTR)
import { useAuthStore } from '../../store/useAuthStore'; // ✅ لجلب بيانات المستخدم

// ... (الـ Interfaces والـ Mock Data زي dealStatuses و userRoles تبقى كما هي تماماً)
const dealStatuses = [
    { 
      id: '1', 
      name: 'New Deal', 
      nameAr: 'صفقة جديدة',
      color: '#3B82F6', 
      order: 1 
    },
    { 
      id: '2', 
      name: 'Negotiation', 
      nameAr: 'تفاوض',
      color: '#8B5CF6', 
      order: 2 
    },
    { 
      id: '3', 
      name: 'Reservation', 
      nameAr: 'حجز',
      color: '#F59E0B', 
      order: 3 
    },
    { 
      id: '4', 
      name: 'Closed Won', 
      nameAr: 'مغلقة - نجاح',
      color: '#10B981', 
      order: 4 
    },
    { 
      id: '5', 
      name: 'Closed Lost', 
      nameAr: 'مغلقة - خسارة',
      color: '#6B7280', 
      order: 5 
    },
  ];

  const propertyTypes = [
    { 
      id: '1', 
      name: 'Apartment',
      nameAr: 'شقة',
      active: true 
    },
    { 
      id: '2', 
      name: 'Villa',
      nameAr: 'فيلا',
      active: true 
    },
    { 
      id: '3', 
      name: 'Commercial',
      nameAr: 'تجاري',
      active: true 
    },
    { 
      id: '4', 
      name: 'Leisure',
      nameAr: 'ترفيهي',
      active: true 
    },
  ];

  const userRoles = [
    { 
      id: '1', 
      name: 'Super Admin', 
      nameAr: 'المدير العام',
      permissions: ['Full System Access', 'User Management', 'System Settings', 'Reports', 'All Modules'],
      permissionsAr: ['الوصول الكامل للنظام', 'إدارة المستخدمين', 'إعدادات النظام', 'التقارير', 'جميع الوحدات'],
      users: 1
    },
    { 
      id: '2', 
      name: 'Admin', 
      nameAr: 'مدير',
      permissions: ['User Management', 'All Modules', 'Reports', 'Lead Assignment'],
      permissionsAr: ['إدارة المستخدمين', 'جميع الوحدات', 'التقارير', 'تعيين العملاء'],
      users: 1
    },
    { 
      id: '3', 
      name: 'Sales', 
      nameAr: 'مبيعات',
      permissions: ['Leads', 'Deals', 'Properties (View Only)', 'Calendar'],
      permissionsAr: ['العملاء المحتملين', 'الصفقات', 'العقارات (عرض فقط)', 'التقويم'],
      users: 3
    },
  ];
export default function SystemSettings() { // ✅ جعلناه Default Export لحل مشكلة الـ Lazy Loading
  const [activeTab, setActiveTab] = useState<'deal-status' | 'property-types' | 'roles' | 'general'>('deal-status');

  // ✅ ربط المتغيرات بالسيستم الجديد لضمان استقرار الصفحة دون تغيير الـ UI
  const { t, i18n } = useTranslation(['settings', 'roles', 'common']); 
  const { dir } = useConfigStore(); 
  const { user } = useAuthStore();
  
  const isRTL = dir === 'rtl'; 
  const language = i18n.language;
  return (
    <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className={`mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
        <div className={`flex items-center gap-3 mb-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
          <SettingsIcon className="w-8 h-8 text-[#B5752A]" />
          <h1 className="text-2xl font-bold text-[#16100A]">
            {t('settings.title')}
          </h1>
        </div>
        <p className="text-[#555555] mb-4">
          {t('settings.subtitle')}
        </p>
        
        {/* Tabs under header */}
        <div className={`flex gap-2 overflow-x-auto pb-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
          {[
            { id: 'deal-status', label: t('settings.dealStatus') },
            { id: 'property-types', label: t('settings.propertyTypes') },
            { id: 'roles', label: t('settings.userRoles') },
            { id: 'general', label: t('settings.general') },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'gradient-primary text-white'
                  : 'bg-white border border-[#E5E5E5] text-[#555555] hover:bg-[#F7F7F7]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Deal Status Tab */}
      {activeTab === 'deal-status' && (
        <div className="space-y-6">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <h2 className="font-bold text-[#16100A] mb-1">{t('settings.dealPipeline')}</h2>
              <p className="text-sm text-[#555555]">{t('settings.customizeStages')}</p>
            </div>
            <button className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all">
              <Plus className="w-5 h-5" />
              {t('settings.addStage')}
            </button>
          </div>

          <div className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#F7F7F7] border-b border-[#E5E5E5]">
                <tr>
                  <th className={`px-6 py-3 text-sm font-semibold text-[#16100A] ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('settings.order')}
                  </th>
                  <th className={`px-6 py-3 text-sm font-semibold text-[#16100A] ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('settings.stageName')}
                  </th>
                  <th className={`px-6 py-3 text-sm font-semibold text-[#16100A] ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('settings.color')}
                  </th>
                  <th className={`px-6 py-3 text-sm font-semibold text-[#16100A] ${isRTL ? 'text-left' : 'text-right'}`}>
                    {t('settings.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {dealStatuses.map((status) => (
                  <tr key={status.id} className="hover:bg-[#FAFAFA]">
                    <td className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <span className="font-medium text-[#16100A]">{status.order}</span>
                    </td>
                    <td className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <span className="font-medium text-[#16100A]">
                        {language === 'ar' ? status.nameAr : status.name}
                      </span>
                    </td>
                    <td className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div 
                          className="w-6 h-6 rounded border border-[#E5E5E5]" 
                          style={{ backgroundColor: status.color }}
                        />
                        <span className="text-sm text-[#555555]" dir="ltr">{status.color}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 ${isRTL ? 'text-left' : 'text-right'}`}>
                      <div className={`flex items-center gap-2 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                        <button className="p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4 text-[#555555]" />
                        </button>
                        <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
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
      )}

      {/* Property Types Tab */}
      {activeTab === 'property-types' && (
        <div className="space-y-6">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <h2 className="font-bold text-[#16100A] mb-1">{t('settings.propertyTypesTitle')}</h2>
              <p className="text-sm text-[#555555]">{t('settings.managePropertyTypes')}</p>
            </div>
            <button className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all">
              <Plus className="w-5 h-5" />
              {t('settings.addType')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {propertyTypes.map((type) => (
              <div key={type.id} className="bg-white rounded-lg border border-[#E5E5E5] p-6">
                <div className={`flex items-start justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <h3 className={`font-bold text-[#16100A] ${isRTL ? 'text-right' : 'text-left'}`}>
                    {language === 'ar' ? type.nameAr : type.name}
                  </h3>
                  <div className="flex gap-1">
                    <button className="p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4 text-[#555555]" />
                    </button>
                    <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <input
                    type="checkbox"
                    checked={type.active}
                    readOnly
                    className="w-4 h-4 text-[#B5752A] border-[#E5E5E5] rounded focus:ring-2 focus:ring-[#B5752A]"
                  />
                  <span className="text-sm text-[#555555]">{t('settings.active')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <h2 className="font-bold text-[#16100A] mb-1">{t('settings.rolesPermissions')}</h2>
              <p className="text-sm text-[#555555]">{t('settings.defineRoles')}</p>
            </div>
            <button className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all">
              <Plus className="w-5 h-5" />
              {t('settings.addRole')}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {userRoles.map((role) => (
              <div key={role.id} className="bg-white rounded-lg border border-[#E5E5E5] p-6">
                <div className={`flex items-start justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <h3 className="font-bold text-[#16100A] mb-1">
                      {language === 'ar' ? role.nameAr : role.name}
                    </h3>
                    <p className="text-sm text-[#555555]">
                      {role.users} {role.users !== 1 ? t('settings.users') : t('settings.user')}
                    </p>
                  </div>
                  <button className="p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4 text-[#555555]" />
                  </button>
                </div>

                <div className="space-y-2">
                  <p className={`text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('settings.permissions')}:
                  </p>
                  {(language === 'ar' ? role.permissionsAr : role.permissions).map((permission, idx) => (
                    <div key={idx} className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                      <div className="w-1.5 h-1.5 rounded-full gradient-primary flex-shrink-0" />
                      <span>{permission}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h2 className="font-bold text-[#16100A] mb-1">{t('settings.generalSettings')}</h2>
            <p className="text-sm text-[#555555]">{t('settings.configureGeneral')}</p>
          </div>

          <div className="bg-white rounded-lg border border-[#E5E5E5] p-6 space-y-6">
            {/* Company Info */}
            <div>
              <h3 className={`font-bold text-[#16100A] mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('settings.companyInfo')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('settings.companyName')}
                  </label>
                  <input
                    type="text"
                    defaultValue="Location Properties"
                    className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('settings.phoneNumber')}
                  </label>
                  <input
                    type="tel"
                    defaultValue="+20 2 1234 5678"
                    className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('settings.email')}
                  </label>
                  <input
                    type="email"
                    defaultValue="info@locationproperties.com"
                    className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('settings.currency')}
                  </label>
                  <select 
                    className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    <option value="EGP">{language === 'ar' ? 'الجنيه المصري (EGP)' : 'Egyptian Pound (EGP)'}</option>
                    <option value="USD">{language === 'ar' ? 'الدولار الأمريكي (USD)' : 'US Dollar (USD)'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="pt-6 border-t border-[#E5E5E5]">
              <h3 className={`font-bold text-[#16100A] mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('settings.notificationSettings')}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="font-medium text-[#16100A]">{t('settings.emailNotifications')}</p>
                    <p className="text-sm text-[#555555]">{t('settings.emailNotificationsDesc')}</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 text-[#B5752A] border-[#E5E5E5] rounded focus:ring-2 focus:ring-[#B5752A] flex-shrink-0"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="font-medium text-[#16100A]">{t('settings.dealUpdates')}</p>
                    <p className="text-sm text-[#555555]">{t('settings.dealUpdatesDesc')}</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 text-[#B5752A] border-[#E5E5E5] rounded focus:ring-2 focus:ring-[#B5752A] flex-shrink-0"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="font-medium text-[#16100A]">{t('settings.newLeadAssignments')}</p>
                    <p className="text-sm text-[#555555]">{t('settings.newLeadAssignmentsDesc')}</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 text-[#B5752A] border-[#E5E5E5] rounded focus:ring-2 focus:ring-[#B5752A] flex-shrink-0"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className={`pt-6 border-t border-[#E5E5E5] flex ${isRTL ? 'justify-end' : 'justify-start'}`}>
              <button className="flex items-center gap-2 gradient-primary text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all">
                <Save className="w-5 h-5" />
                {t('settings.saveChanges')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}