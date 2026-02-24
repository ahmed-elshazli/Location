import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Shield, UserCheck, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // ✅ البديل الصحيح
import { useConfigStore } from '../../store/useConfigStore'; // ✅ لجلب الاتجاه
import { useAuthStore } from '../../store/useAuthStore'; // ✅ لجلب بيانات المستخدم

// ... (واجهة UserData ومصفوفة mockUsers تبقى كما هي تماماً)
interface UserData {
  id: string;
  name: string;
  nameAr: string;
  email: string;
  role: 'super_admin' | 'admin' | 'sales';
  status: 'active' | 'inactive';
  phone: string;
  joinedDate: string;
  performance?: {
    sales: number;
    revenue: number;
  };
}

const mockUsers: UserData[] = [
  {
    id: '1',
    name: 'Ahmed Hassan',
    nameAr: 'أحمد حسن',
    email: 'superadmin@locationproperties.com',
    role: 'super_admin',
    status: 'active',
    phone: '+20 100 111 2222',
    joinedDate: '2025-01-15',
  },
  {
    id: '2',
    name: 'Sarah Ahmed',
    nameAr: 'سارة أحمد',
    email: 'admin@locationproperties.com',
    role: 'admin',
    status: 'active',
    phone: '+20 111 222 3333',
    joinedDate: '2025-02-01',
  },
  {
    id: '3',
    name: 'Mohamed Ali',
    nameAr: 'محمد علي',
    email: 'sales@locationproperties.com',
    role: 'sales',
    status: 'active',
    phone: '+20 122 333 4444',
    joinedDate: '2025-03-10',
    performance: { sales: 24, revenue: 1800000 }
  },
  {
    id: '4',
    name: 'Fatima Khalil',
    nameAr: 'فاطمة خليل',
    email: 'fatima.k@locationproperties.com',
    role: 'sales',
    status: 'active',
    phone: '+20 100 444 5555',
    joinedDate: '2025-04-20',
    performance: { sales: 19, revenue: 1450000 }
  },
  {
    id: '5',
    name: 'Omar Ibrahim',
    nameAr: 'عمر إبراهيم',
    email: 'omar.i@locationproperties.com',
    role: 'sales',
    status: 'inactive',
    phone: '+20 111 555 6666',
    joinedDate: '2025-05-15',
    performance: { sales: 12, revenue: 850000 }
  },
  {
    id: '6',
    name: 'Esmaeil Mohamed',
    nameAr: 'إسماعيل محمد',
    email: 'esmaeil.m@locationproperties.com',
    role: 'sales',
    status: 'active',
    phone: '+20 122 666 7777',
    joinedDate: '2025-06-01',
    performance: { sales: 31, revenue: 2100000 }
  },
  {
    id: '7',
    name: 'Abdallah Elgamal',
    nameAr: 'عبدالله الجمال',
    email: 'abdallah.e@locationproperties.com',
    role: 'sales',
    status: 'active',
    phone: '+20 100 777 8888',
    joinedDate: '2025-07-10',
    performance: { sales: 28, revenue: 1950000 }
  },
  {
    id: '8',
    name: 'Raghad',
    nameAr: 'رغد',
    email: 'raghad@locationproperties.com',
    role: 'sales',
    status: 'active',
    phone: '+20 111 888 9999',
    joinedDate: '2025-08-15',
    performance: { sales: 22, revenue: 1650000 }
  },
];

export default function UsersManagement() { // ✅ جعلناه Default Export لحل مشكلة الـ Lazy Loading
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // ✅ ربط المتغيرات بالسيستم الجديد لتعمل مع الـ UI الحالي
  const { t, i18n } = useTranslation(['users', 'roles', 'common']); 
  const { dir } = useConfigStore(); 
  const { user } = useAuthStore();
  
  const isRTL = dir === 'rtl'; 
  const language = i18n.language;

  // --- الحفاظ على كل توابع الفلترة والألوان كما هي حرفياً ---
  const filteredUsers = mockUsers.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.nameAr.includes(searchTerm) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-[#FEF3E2] text-[#B5752A] border-[#B5752A]';
      case 'admin': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'sales': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <Shield className="w-4 h-4" />;
      case 'admin': return <UserCheck className="w-4 h-4" />;
      case 'sales': return <TrendingUp className="w-4 h-4" />;
      default: return null;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return t('roles:role.superadmin');
      case 'admin': return t('roles:role.admin');
      case 'sales': return t('roles:role.sales');
      default: return role;
    }
  };
  return (
    <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h1 className="text-2xl font-bold text-[#16100A] mb-2">{t('users.management')}</h1>
            <p className="text-[#555555]">{t('users.managementSubtitle')}</p>
          </div>
          <button className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all">
            <Plus className="w-5 h-5" />
            {t('users.addUser')}
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]`} />
            <input
              type="text"
              placeholder={t('users.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`}
            />
          </div>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className={`px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] ${isRTL ? 'text-right' : 'text-left'}`}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <option value="all">{t('users.allRoles')}</option>
            <option value="super_admin">{t('role.superAdmin')}</option>
            <option value="admin">{t('role.admin')}</option>
            <option value="sales">{t('role.sales')}</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] ${isRTL ? 'text-right' : 'text-left'}`}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <option value="all">{t('users.allStatus')}</option>
            <option value="active">{t('users.active')}</option>
            <option value="inactive">{t('users.inactive')}</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
            <thead className="bg-[#F7F7F7] border-b border-[#E5E5E5]">
              <tr>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-sm font-semibold text-[#16100A]`}>{t('users.user')}</th>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-sm font-semibold text-[#16100A]`}>{t('common.role')}</th>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-sm font-semibold text-[#16100A]`}>{t('users.contact')}</th>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-sm font-semibold text-[#16100A]`}>{t('common.status')}</th>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-sm font-semibold text-[#16100A]`}>{t('users.joinedDate')}</th>
                <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-sm font-semibold text-[#16100A]`}>{t('users.performance')}</th>
                <th className={`px-6 py-3 ${isRTL ? 'text-left' : 'text-right'} text-sm font-semibold text-[#16100A]`}>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {filteredUsers.map((userData) => (
                <tr key={userData.id} className="hover:bg-[#FAFAFA]">
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {language === 'ar' ? userData.nameAr.charAt(0) : userData.name.charAt(0)}
                      </div>
                      <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <p className="font-medium text-[#16100A]">{language === 'ar' ? userData.nameAr : userData.name}</p>
                        <p className={`text-sm text-[#555555] ${isRTL ? 'text-right' : 'text-left'}`}>
                          <span dir="ltr" className="inline-block">{userData.email}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getRoleBadgeColor(userData.role)} ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {getRoleIcon(userData.role)}
                      {getRoleLabel(userData.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#555555]" dir="ltr">{userData.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${
                      userData.status === 'active' 
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {userData.status === 'active' ? t('users.active') : t('users.inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#555555]" dir="ltr">
                      {new Date(userData.joinedDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {userData.performance ? (
                      <div className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                        <p className="font-medium text-[#16100A]">{userData.performance.sales} {t('users.sales')}</p>
                        <p className="text-[#555555]" dir="ltr">{(userData.performance.revenue / 1000000).toFixed(1)} {language === 'ar' ? 'مليون جنيه' : 'M EGP'}</p>
                      </div>
                    ) : (
                      <span className="text-sm text-[#555555]">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
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
    </div>
  );
}