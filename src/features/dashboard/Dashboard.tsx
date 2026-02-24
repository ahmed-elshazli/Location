import React from 'react';
import { useAuthStore } from '../../store/useAuthStore'; 
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../store/useConfigStore';
import { Building2, TrendingUp, Users, DollarSign, Target, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ✅ لازم المصفوفات دي تكون موجودة "خارج" المكون
const salesData = [
  { month: 'Jan', monthAr: 'يناير', sales: 45, revenue: 2800000 },
  { month: 'Feb', monthAr: 'فبراير', sales: 52, revenue: 3200000 },
  { month: 'Mar', monthAr: 'مارس', sales: 48, revenue: 2900000 },
  { month: 'Apr', monthAr: 'أبريل', sales: 61, revenue: 3800000 },
  { month: 'May', monthAr: 'مايو', sales: 55, revenue: 3400000 },
  { month: 'Jun', monthAr: 'يونيو', sales: 67, revenue: 4200000 },
];

const topAgents = [
  { name: 'Abdallah Elgamal', nameAr: 'عبدالله الجمال', sales: 24, revenue: 1800000 },
  { name: 'Esmaeil Mohamed', nameAr: 'إسماعيل محمد', sales: 19, revenue: 1450000 },
  { name: 'Raghad', nameAr: 'رغد', sales: 16, revenue: 1200000 },
  { name: 'Noha', nameAr: 'نهى', sales: 14, revenue: 980000 },
  { name: 'Mohamed Elbaze', nameAr: 'محمد الباز', sales: 12, revenue: 850000 },
];

const topAreas = [
  { name: 'Madinaty', nameAr: 'مدينتي', units: 145, percentage: 32 },
  { name: 'Rehab', nameAr: 'الرحاب', units: 98, percentage: 22 },
  { name: 'Celia', nameAr: 'سيليا', units: 76, percentage: 17 },
  { name: 'Thousand', nameAr: 'التجمع', units: 65, percentage: 14 },
  { name: 'Sharm Bay', nameAr: 'شرم باي', units: 54, percentage: 12 },
];

const recentActivities = [
  { id: 1, type: 'deal', title: 'Deal closed for Villa B1-034', titleAr: 'تم إغلاق صفقة فيلا B1-034', agent: 'Abdallah Elgamal', agentAr: 'عبدالله الجمال', time: '5 min ago', timeAr: 'منذ 5 دقائق' },
  { id: 2, type: 'lead', title: 'New lead: Sarah Mohamed', titleAr: 'عميل محتمل جديد: سارة محمد', agent: 'Esmaeil Mohamed', agentAr: 'إسماعيل محمد', time: '15 min ago', timeAr: 'منذ 15 دقيقة' },
  { id: 3, type: 'property', title: 'Property added: Apartment 45', titleAr: 'تمت إضافة عقار: شقة 45', agent: 'System', agentAr: 'النظام', time: '1 hour ago', timeAr: 'منذ ساعة' },
  { id: 4, type: 'deal', title: 'Reservation confirmed for unit 78', titleAr: 'تم تأكيد حجز للوحدة 78', agent: 'Raghad', agentAr: 'رغد', time: '2 hours ago', timeAr: 'منذ ساعتين' },
  { id: 5, type: 'lead', title: 'Lead converted to client', titleAr: 'تم تحويل عميل محتمل إلى عميل', agent: 'Noha', agentAr: 'نهى', time: '3 hours ago', timeAr: 'منذ 3 ساعات' },
];
export default function Dashboard() {
  const { t, i18n } = useTranslation('dashboard'); 
  const { dir } = useConfigStore(); 
  const { user } = useAuthStore(); 
  
  const isRTL = dir === 'rtl';
  const currentLang = i18n.language;

  // الحارس لمنع خطأ الـ undefined name اللي ظهرلك قبل كدة
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#B5752A]"></div>
      </div>
    );
  }

  return (
   <div className="p-6">
      {/* Header */}
      <div className={`mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
        <h1 className="text-2xl font-bold text-[#16100A] mb-2">
          {t('welcome') || 'Welcome'}, {user?.name}
        </h1>
        <p className="text-[#555555]">{t('overview') || 'Dashboard Overview'}</p>
      </div>

      {/* Key Metrics - 6 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {[
          { icon: Building2, val: '1,248', label: t('properties'), color: 'blue' },
          { icon: CheckCircle, val: '856', label: currentLang === 'ar' ? 'الوحدات المتاحة' : 'Available Units', color: 'green' },
          { icon: TrendingUp, val: '328', label: currentLang === 'ar' ? 'الوحدات المباعة' : 'Sold Units', color: 'orange' },
          { icon: Target, val: '64', label: t('activeDeals'), color: 'purple' },
          { icon: Users, val: '142', label: t('totalLeads'), color: 'orange' },
          { icon: DollarSign, val: '18.2M', label: t('revenue'), color: 'emerald' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-[#E5E5E5] p-6">
            <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 bg-${item.color}-50 rounded-lg flex items-center justify-center`}>
                <item.icon className={`w-5 h-5 text-${item.color}-600`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#16100A] mb-1" dir="ltr">{item.val}</p>
            <p className={`text-sm text-[#555555] ${isRTL ? 'text-right' : 'text-left'}`}>{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-[#E5E5E5] p-6">
          <div className={`mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h2 className="font-bold text-[#16100A] mb-1">{currentLang === 'ar' ? 'نظرة عامة على المبيعات' : 'Sales Overview'}</h2>
            <p className="text-sm text-[#555555]">{currentLang === 'ar' ? 'أداء المبيعات الشهري' : 'Monthly sales performance'}</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis 
                dataKey={currentLang === 'ar' ? 'monthAr' : 'month'} 
                reversed={isRTL}
                style={{ fontSize: '12px' }}
              />
              <YAxis orientation={isRTL ? 'right' : 'left'} style={{ fontSize: '12px' }} />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#B5752A" strokeWidth={2} dot={{ fill: '#B5752A' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Areas */}
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
          <div className={`mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h2 className="font-bold text-[#16100A] mb-1">{currentLang === 'ar' ? 'أفضل المناطق' : 'Top Areas'}</h2>
          </div>
          <div className="space-y-4">
            {topAreas.map((area) => (
              <div key={area.name}>
                <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-sm font-medium">{currentLang === 'ar' ? area.nameAr : area.name}</span>
                  <span className="text-sm text-[#555555]" dir="ltr">{area.units}</span>
                </div>
                <div className="w-full bg-[#F7F7F7] rounded-full h-2">
                  <div className="bg-[#B5752A] h-2 rounded-full" style={{ width: `${area.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Top Agents */}
  <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
    <div className={`mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
      <h2 className="font-bold text-[#16100A] mb-1">
        {currentLang === 'ar' ? 'أفضل المبيعات' : 'Top Sales Agents'}
      </h2>
      <p className="text-sm text-[#555555]">{t('thisMonth') || 'This Month'}</p>
    </div>
    <div className="space-y-4">
      {topAgents.map((agent, index) => (
        <div 
          key={agent.name} 
          className={`flex items-center gap-4 p-3 hover:bg-[#F7F7F7] rounded-lg transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {index + 1}
          </div>
          <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
            <p className="font-medium text-[#16100A]">
              {currentLang === 'ar' ? agent.nameAr : agent.name}
            </p>
            <p className="text-sm text-[#555555]" dir="ltr">
              {agent.sales} {currentLang === 'ar' ? 'صفقة' : 'deals'} • EGP {(agent.revenue / 1000000).toFixed(1)}M
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Recent Activity */}
  <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
    <div className={`mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
      <h2 className="font-bold text-[#16100A] mb-1">
        {t('recentActivity') || 'Recent Activity'}
      </h2>
      <p className="text-sm text-[#555555]">
        {currentLang === 'ar' ? 'آخر التحديثات' : 'Latest updates'}
      </p>
    </div>
    <div className="space-y-4">
      {recentActivities.map((activity) => (
        <div 
          key={activity.id} 
          className={`flex gap-3 pb-4 border-b border-[#F7F7F7] last:border-0 last:pb-0 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
            activity.type === 'deal' ? 'bg-green-500' : 
            activity.type === 'lead' ? 'bg-blue-500' : 
            'bg-purple-500'
          }`} />
          <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
            <p className="text-sm font-medium text-[#16100A]">
              {currentLang === 'ar' ? activity.titleAr : activity.title}
            </p>
            <p className="text-xs text-[#555555] mt-1">
              {currentLang === 'ar' ? activity.agentAr : activity.agent} • {currentLang === 'ar' ? activity.timeAr : activity.time}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

    </div>
  );
}