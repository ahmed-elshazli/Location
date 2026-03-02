import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Shield, UserCheck, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../store/useConfigStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useRegister } from './hooks/useRegister';
import { z } from "zod";
import { useUsers } from './hooks/useUsers';
import { useUpdateUser } from './hooks/useUpdateUser';
import { useDeleteUser } from './hooks/useDeleteUser';
import { useQueryClient } from '@tanstack/react-query';

// --- [1] Zod Schema (Validation Rules) ---
const userSchema = z.object({
  fullName: z.string()
    .min(6, "Full name must be at least 6 characters")
    .nonempty("Full name is required"),
  email: z.string()
    .email("Invalid email address")
    .nonempty("Email is required"),
  password: z.string()
    .optional()
    .or(z.literal('')) // يسمح بالنص الفارغ
    .refine((val) => !val || val.length >= 8, {
      message: "Password must be at least 8 characters",
    })
    .refine((val) => {
      if (!val) return true; // لو فاضي عدي الفحص
      return /[A-Z]/.test(val) && /[a-z]/.test(val) && /[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val);
    }, "Must contain uppercase, lowercase, number and special character"),
  role: z.enum(["admin", "sales", "user", "super_admin"]),
  phone: z.string()
    .nonempty("Phone number is required")
    .refine((val) => {
      const egyptLocal = /^01[0125]\d{8}$/;
      const saudiLocal = /^05\d{8}$/;
      const international = /^(\+20|\+966)\d{9,10}$/;
      return egyptLocal.test(val) || saudiLocal.test(val) || international.test(val);
    }, "Please enter a valid local number (e.g., 01xxxx or 05xxxx)"),
});

// --- [2] Helper Function for Phone Normalization ---
const formatPhoneForBackend = (input: string) => {
  const cleaned = input.replace(/\D/g, ''); 
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    return `+20${cleaned.substring(1)}`;
  }
  if (cleaned.startsWith('05') && cleaned.length === 10) {
    return `+966${cleaned.substring(1)}`;
  }
  return input.startsWith('+') ? input : `+${input}`; 
};

// ... (UserData Interface & mockUsers remain the same)
interface UserData {
  id: string;
  name: string;
  nameAr: string;
  email: string;
  role: 'super_admin' | 'admin' | 'sales';
  status: 'active' | 'inactive';
  phone: string;
  joinedDate: string;
  performance?: { sales: number; revenue: number; };
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

export default function UsersManagement() { 
  const [users, setUsers] = useState<UserData[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // States for Modal and Form Inputs
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState(''); // Use it for UI only if needed, won't be sent to backend
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'sales' | 'user' | 'super_admin'>('sales');

  const createUser = useRegister();
  const { t, i18n } = useTranslation(['users', 'roles', 'common']); 
  const { dir } = useConfigStore(); 
  const { user: currentUser } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null); 
const updateUserMutation = useUpdateUser(); 
const deleteUserMutation = useDeleteUser();
const queryClient = useQueryClient(); 

  // حالة الإشعار الديناميكي (نجاح أو خطأ)
const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({
  show: false,
  msg: '',
  type: 'success',
});

// استبدل سطر الـ useState الخاص بـ users بهذا السطر:
const { data: backendUsers, isLoading, error } = useUsers(); 

// عدل منطق الـ filteredUsers ليتعامل مع بيانات الباك إيند (fullName)
const usersList = Array.isArray(backendUsers) 
  ? backendUsers 
  : (backendUsers?.data || backendUsers?.users || []); // بيجرب أكتر من مكان محتمل للمصفوفة

// 3. ثالثاً: الفلترة دلوقت هتشتغل من غير ما التطبيق ينهار
const filteredUsers = usersList.filter((u: any) => {
  const matchesSearch = 
    (u.fullName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    
  return matchesSearch && (filterRole === 'all' || u.role === filterRole);
});

// دالة إظهار الإشعار
const triggerToast = (msg: string, type: 'success' | 'error') => {
  setToast({ show: true, msg, type });
  setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 4000);
};
  const isRTL = dir === 'rtl'; 
  const language = i18n.language;

  // --- Logic Functions ---
  const handleSaveNewUser = (e: React.FormEvent) => {
  e.preventDefault();

  // 1. تجميع البيانات من الـ States
  const rawData = {
    fullName: name,
    email: email,
    password: password, // تأكد لو الباك إيند بيطلب الباسورد في التعديل ولا لأ
    role: selectedRole,
    phone: phone 
  };

  // 2. التحقق باستخدام Zod
  const validationResult = userSchema.safeParse(rawData);

  if (!validationResult.success) {
    triggerToast(validationResult.error.issues[0].message, 'error');
    return;
  }

  // 3. تجهيز البيانات النهائية (تنسيق الهاتف)
  const finalPayload = {
    ...validationResult.data,
    phone: formatPhoneForBackend(phone) 
  };

  // ---------------------------------------------------------
  // 🚀 الجزء الجديد: التفرقة بين التعديل والإضافة
  // ---------------------------------------------------------
  
  if (editingUser) {
  // 1. تجهيز نسخة من البيانات المرسلة
  const updatePayload = { ...finalPayload };

  // 2. 🛡️ حذف خاصية الباسورد تماماً عشان السيرفر ما يعترضش
  delete updatePayload.password;

  // 3. إرسال الطلب "النظيف" بدون password
  updateUserMutation.mutate(
    { id: editingUser.id, data: updatePayload }, // نبعت الـ updatePayload المنظف
    {
      onSuccess: () => {
        setIsModalOpen(false);
        setEditingUser(null);
        triggerToast(t('users.userUpdatedSuccess') || 'تم التحديث بنجاح', 'success');
        resetForm();
      },
        onError: (error: any) => {
          const apiError = error.response?.data?.message || "فشل تحديث البيانات";
          triggerToast(Array.isArray(apiError) ? apiError[0] : apiError, 'error');
        }
      }
    );
  } else {
    // ✅ حالة الإضافة الجديدة (POST)
    // هنا الباسورد إلزامي عكس التعديل
    if (!password) {
      triggerToast("Password is required for new users", "error");
      return;
    }

    createUser.mutate(finalPayload, {
      onSuccess: () => {
        setIsModalOpen(false);
        triggerToast(t('users.userAddedSuccess') || 'تم إضافة المستخدم بنجاح', 'success');
        resetForm(); // تنظيف الحقول
      },
      onError: (error: any) => {
        const apiError = error.response?.data?.message || "حدث خطأ أثناء إضافة المستخدم";
        triggerToast(Array.isArray(apiError) ? apiError[0] : apiError, 'error');
      }
    });
  }
};

// دالة مساعدة لمسح الحقول
const resetForm = () => {
  setName(''); setEmail(''); setPassword(''); setPhone(''); setNameAr('');
};

  

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return t('roles:roles.superAdmin'); 
      case 'admin': return t('roles:roles.admin');
      case 'sales': return t('roles:roles.sales');
      default: return role;
    }
  };

  // --- [3] Helper Functions for UI (Badge Colors & Icons) ---
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

  if (isLoading) {
  return (
    <div className="h-64 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B5752A]"></div>
    </div>
  );
}

const handleEditClick = (userData: any) => {
  setEditingUser(userData); // حفظ بيانات المستخدم اللي بنعدله
  
  // تعبئة الحقول بالبيانات الحالية
  setName(userData.fullName || ''); 
  setEmail(userData.email || '');
  setPhone(userData.phone || '');
  setSelectedRole(userData.role === 'salse' ? 'sales' : userData.role); // معالجة الـ Typo
  setPassword(''); // غالباً بنسيب الباسورد فاضي في التعديل إلا لو هنغيره
  
  setIsModalOpen(true); // فتح المودال
};

// تحديث دالة الإغلاق لتصفير البيانات
const handleCloseModal = () => {
  setIsModalOpen(false);
  setEditingUser(null);
  setName(''); setEmail(''); setPhone(''); setPassword('');
};


const handleDeleteUser = (id: string, name: string) => {
  if (window.confirm(`هل أنت متأكد من حذف المستخدم "${name}"؟`)) {
    // نبعت طلب الحذف للسيرفر
    deleteUserMutation.mutate(id, {
      onSuccess: () => {
        // ✅ السطر السحري: بيمسح الكاش القديم ويجيب القائمة الجديدة من السيرفر فوراً
        queryClient.invalidateQueries({ queryKey: ['users'] });
        
        triggerToast('تم حذف المستخدم بنجاح', 'success');
      },
      onError: (error: any) => {
        const apiError = error.response?.data?.message || "فشل حذف المستخدم";
        triggerToast(Array.isArray(apiError) ? apiError[0] : apiError, 'error');
      }
    });
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
          <button
onClick={() => setIsModalOpen(true)}            disabled={currentUser?.role !== 'super_admin' && currentUser?.role !== 'admin'} 
           className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all">
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
            <option value="super_admin">{t('roles:roles.superAdmin')}</option>
            <option value="admin">{t('roles:roles.admin')}</option>
            <option value="sales">{t('roles:roles.sales')}</option>
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
    <tr key={userData.id} className="hover:bg-[#FAFAFA]">
      <td className="px-6 py-4">
        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
            {userData.fullName?.charAt(0) || "U"}
          </div>
          <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
            <p className="font-medium text-[#16100A]">{userData.fullName}</p>
            <p className={`text-sm text-[#555555] ${isRTL ? 'text-right' : 'text-left'}`}>
              <span dir="ltr">{userData.email}</span>
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getRoleBadgeColor(userData.role)}`}>
          {getRoleIcon(userData.role)}
          {userData.role === 'salse' ? 'Sales' : getRoleLabel(userData.role)} 
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
                      <button onClick={() => handleEditClick(userData)} className="p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4 text-[#555555]" />
                      </button>
                      <button
                      onClick={() => handleDeleteUser(userData.id, userData.fullName)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors">
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
      {isModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
    <div 
      className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between bg-[#F7F7F7]">
        <h2 className="text-xl font-bold text-[#16100A]">
  {editingUser ? t('users.editUser') : t('users.addUser')}
</h2>
        <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <Plus className="w-6 h-6 rotate-45 text-[#555555]" />
        </button>
      </div>

      {/* Form Body */}
      <form className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSaveNewUser}>
  {/* Name English */}
  <div className="space-y-1">
    <label className="text-sm font-medium text-[#16100A]">{t('users.title')} (EN)</label>
    <input 
      value={name} 
      onChange={(e) => setName(e.target.value)} 
      type="text" 
      className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none" 
      placeholder="e.g. Ahmed Hassan" 
    />
  </div>

  {/* Name Arabic - Optional based on your logic */}
  <div className="space-y-1">
    <label className="text-sm font-medium text-[#16100A]">{t('users.title')} (AR)</label>
    <input 
      value={nameAr} 
      onChange={(e) => setNameAr(e.target.value)} 
      type="text" 
      className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none" 
      placeholder="مثلاً: أحمد حسن" 
    />
  </div>

  {/* Email */}
  <div className="space-y-1 md:col-span-2">
    <label className="text-sm font-medium text-[#16100A]">{t('email')}</label>
    <input 
      value={email} 
      onChange={(e) => setEmail(e.target.value)} 
      type="email" 
      className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none" 
      placeholder="name@locationproperties.com" 
    />
  </div>

  {/* Phone */}
  <div className="space-y-1">
    <label className="text-sm font-medium text-[#16100A]">{t('phone')}</label>
    <input 
      value={phone} 
      onChange={(e) => setPhone(e.target.value)} 
      type="text" 
      className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none" 
      placeholder="+20 100..." 
    />
  </div>

  {/* Role */}
  <div className="space-y-1">
    <label className="text-sm font-medium text-[#16100A]">{t('common:common.role')}</label>
    <select 
      value={selectedRole} 
      onChange={(e) => setSelectedRole(e.target.value as any)} 
      className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none bg-white"
    >
      <option value="sales">{t('roles:roles.sales')}</option>
      <option value="admin">{t('roles:roles.admin')}</option>
      <option value="super_admin">{t('roles:roles.superAdmin')}</option>
    </select>
  </div>

  {/* Password */}
  {!editingUser && (
  <div className="space-y-1 md:col-span-2">
    <label className="text-sm font-medium text-[#16100A]">{t('password')}</label>
    <input 
      value={password} 
      onChange={(e) => setPassword(e.target.value)} 
      type="password" 
      className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none" 
    />
  </div>
)}
</form>

      {/* Actions */}
      <div className="px-6 py-4 bg-[#F7F7F7] border-t border-[#E5E5E5] flex items-center justify-end gap-3">
        <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 border border-[#E5E5E5] rounded-lg hover:bg-gray-100 transition-colors text-[#555555]">
          {t('cancel')}
        </button>
        <button 
        type="submit"
  onClick={handleSaveNewUser}
        className="px-8 py-2 gradient-primary text-white rounded-lg hover:opacity-90 shadow-lg shadow-[#B5752A]/20 transition-all font-bold">
          {editingUser ? t('common:common.save') : t('users.save')}
        </button>
      </div>
    </div>
  </div>
)}

{toast.show && (
  <div className={`fixed bottom-10 ${isRTL ? 'left-10' : 'right-10'} z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300`}>
    <div className={`bg-white border-r-4 ${toast.type === 'success' ? 'border-[#B5752A]' : 'border-red-600'} shadow-2xl rounded-xl p-4 flex items-center gap-4 min-w-[320px]`}>
      <div className={`${toast.type === 'success' ? 'bg-green-100' : 'bg-red-100'} p-2 rounded-full`}>
        {toast.type === 'success' ? (
          <UserCheck className="w-6 h-6 text-green-600" />
        ) : (
          <Shield className="w-6 h-6 text-red-600" /> // أيقونة تحذير للخطأ
        )}
      </div>
      <div className={isRTL ? 'text-right' : 'text-left'}>
        <h4 className="text-[#16100A] font-bold text-sm">
          {toast.type === 'success' ? t('common:common.success') : t('common:common.error')}
        </h4>
        <p className="text-[#555555] text-xs">{toast.msg}</p>
      </div>
      <button 
        onClick={() => setToast({ ...toast, show: false })} 
        className="ms-auto p-1 hover:bg-gray-100 rounded-full"
      >
        <Plus className="w-4 h-4 rotate-45 text-gray-400" />
      </button>
    </div>
  </div>
)}
    </div>
    
  );
}