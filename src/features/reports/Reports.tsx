import React, { useState } from 'react';
import { Download, TrendingUp, Users, Building2, DollarSign, Target } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next'; // ✅ البديل الصحيح للترجمة
import { useConfigStore } from '../../store/useConfigStore'; // ✅ لجلب الاتجاه (RTL/LTR)
import { useAuthStore } from '../../store/useAuthStore'; // ✅ لجلب بيانات المستخدم

// ... (مصفوفات البيانات مثل salesByAgent و monthlyRevenue تبقى كما هي تماماً)

export default function Reports() { // ✅ جعلناه Default Export لحل مشكلة الـ Lazy Loading
  const [reportType, setReportType] = useState<'overview' | 'sales' | 'properties' | 'conversion'>('overview');
  
  // ✅ ربط المتغيرات بالسيستم الجديد لضمان استقرار الصفحة
  const { t, i18n } = useTranslation(['reports', 'common']); 
  const { dir } = useConfigStore(); 
  const { user } = useAuthStore();
  
  const isRTL = dir === 'rtl'; 
  const language = i18n.language;

  // الحفاظ على خرائط الأسماء (AgentNames, AreaNames, MonthNames) كما هي حرفياً
  
  const salesByAgent = [
  { name: 'Ahmed Hassan', sales: 24, revenue: 1800000 },
  { name: 'Sarah Ahmed', sales: 19, revenue: 1450000 },
  { name: 'Mohamed Ali', sales: 16, revenue: 1200000 },
  { name: 'Fatima Khalil', sales: 14, revenue: 980000 },
  { name: 'Omar Ibrahim', sales: 12, revenue: 850000 },
];

const salesByArea = [
  { name: 'Madinaty', value: 145, percentage: 32 },
  { name: 'Rehab', value: 98, percentage: 22 },
  { name: 'Celia', value: 76, percentage: 17 },
  { name: 'Thousand', value: 65, percentage: 14 },
  { name: 'Sharm Bay', value: 54, percentage: 12 },
];

const monthlyRevenue = [
  { month: 'Jan', revenue: 2800000, target: 3000000 },
  { month: 'Feb', revenue: 3200000, target: 3000000 },
  { month: 'Mar', revenue: 2900000, target: 3000000 },
  { month: 'Apr', revenue: 3800000, target: 3500000 },
  { month: 'May', revenue: 3400000, target: 3500000 },
  { month: 'Jun', revenue: 4200000, target: 4000000 },
];

const propertyTypes = [
  { name: 'Apartments', value: 658, color: '#3B82F6' },
  { name: 'Villas', value: 412, color: '#E0A626' },
  { name: 'Commercial', value: 128, color: '#8B5CF6' },
  { name: 'Leisure', value: 50, color: '#10B981' },
];

const conversionRates = [
  { stage: 'Leads', count: 142, percentage: 100 },
  { stage: 'Contacted', count: 98, percentage: 69 },
  { stage: 'Interested', count: 76, percentage: 54 },
  { stage: 'Converted', count: 48, percentage: 34 },
];

  const agentNames = {
    'Ahmed Hassan': 'أحمد حسن',
    'Sarah Ahmed': 'سارة أحمد',
    'Mohamed Ali': 'محمد علي',
    'Fatima Khalil': 'فاطمة خليل',
    'Omar Ibrahim': 'عمر إبراهيم',
  };

  const areaNames = {
    'Madinaty': 'مدينتي',
    'Rehab': 'الرحاب',
    'Celia': 'سيليا',
    'Thousand': 'ألف مسكن',
    'Sharm Bay': 'خليج شرم',
  };

  const monthNames = {
    'Jan': 'يناير',
    'Feb': 'فبراير',
    'Mar': 'مارس',
    'Apr': 'أبريل',
    'May': 'مايو',
    'Jun': 'يونيو',
  };

  return (
    <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-6">
        <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h1 className="text-2xl font-bold text-[#16100A] mb-2">{t('reports.analytics')}</h1>
            <p className="text-[#555555]">{t('reports.comprehensiveInsights')}</p>
          </div>
          <button className={`flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Download className="w-5 h-5" />
            {t('reports.exportReport')}
          </button>
        </div>

        {/* Report Type Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: t('reports.overview') },
            { id: 'sales', label: t('reports.salesPerformance') },
            { id: 'properties', label: t('reports.propertyAnalytics') },
            { id: 'conversion', label: t('reports.conversionFunnel') },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setReportType(type.id as any)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                reportType === type.id
                  ? 'gradient-primary text-white'
                  : 'bg-white border border-[#E5E5E5] text-[#555555] hover:bg-[#F7F7F7]'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">+12%</span>
          </div>
          <p className="text-2xl font-bold text-[#16100A] mb-1">1,248</p>
          <p className="text-sm text-[#555555]">{t('reports.totalProperties')}</p>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-[#FEF3E2] rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#B5752A]" />
            </div>
            <span className="text-green-600 text-sm font-medium">+8%</span>
          </div>
          <p className="text-2xl font-bold text-[#16100A] mb-1">328</p>
          <p className="text-sm text-[#555555]">{t('reports.unitsSoldThisMonth')}</p>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">+15%</span>
          </div>
          <p className="text-2xl font-bold text-[#16100A] mb-1" dir="ltr">18.2M</p>
          <p className="text-sm text-[#555555]">{t('reports.totalRevenue')}</p>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">+5%</span>
          </div>
          <p className="text-2xl font-bold text-[#16100A] mb-1">34%</p>
          <p className="text-sm text-[#555555]">{t('reports.conversionRate')}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Monthly Revenue */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-[#E5E5E5] p-6" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className={`mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h2 className="font-bold text-[#16100A] mb-1">{t('reports.monthlyRevenue')}</h2>
            <p className="text-sm text-[#555555]">{t('reports.revenuePerformance')}</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis 
                dataKey="month" 
                stroke="#555555" 
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => language === 'ar' ? monthNames[value as keyof typeof monthNames] : value}
              />
              <YAxis stroke="#555555" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #E5E5E5',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                labelFormatter={(value) => language === 'ar' ? monthNames[value as keyof typeof monthNames] : value}
              />
              <Legend 
                formatter={(value) => value === 'revenue' ? t('reports.revenue') : t('reports.target')}
              />
              <Bar dataKey="revenue" fill="#B5752A" name={t('reports.revenue')} />
              <Bar dataKey="target" fill="#E5E5E5" name={t('reports.target')} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Property Types Distribution */}
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className={`mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h2 className="font-bold text-[#16100A] mb-1">{t('reports.propertyTypes')}</h2>
            <p className="text-sm text-[#555555]">{t('reports.distributionByType')}</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={propertyTypes}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {propertyTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {propertyTypes.map((type) => (
              <div key={type.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                  <span className="text-[#555555]">
                    {type.name === 'Apartments' && t('reports.apartments')}
                    {type.name === 'Villas' && t('reports.villas')}
                    {type.name === 'Commercial' && t('reports.commercial')}
                    {type.name === 'Leisure' && t('reports.leisure')}
                  </span>
                </div>
                <span className="font-medium text-[#16100A]">{type.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Agent */}
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className={`mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h2 className="font-bold text-[#16100A] mb-1">{t('reports.salesByAgent')}</h2>
            <p className="text-sm text-[#555555]">{t('reports.topPerforming')}</p>
          </div>
          <div className="space-y-4">
            {salesByAgent.map((agent, index) => (
              <div key={agent.name} className="flex items-center gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                  index === 0 ? 'gradient-primary' : 'bg-[#555555]'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-[#16100A]">
                      {language === 'ar' ? agentNames[agent.name as keyof typeof agentNames] : agent.name}
                    </span>
                    <span className="text-sm text-[#555555]">
                      {agent.sales} {t('reports.sales')}
                    </span>
                  </div>
                  <div className="w-full bg-[#F7F7F7] rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${index === 0 ? 'bg-gradient-to-r from-[#B5752A] to-[#DDD68A]' : 'bg-[#555555]'}`}
                      style={{ width: `${(agent.sales / salesByAgent[0].sales) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#555555] mt-1" dir="ltr">
                    {(agent.revenue / 1000000).toFixed(1)}M {t('reports.egp')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className={`mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h2 className="font-bold text-[#16100A] mb-1">{t('reports.conversionFunnelTitle')}</h2>
            <p className="text-sm text-[#555555]">{t('reports.leadToPipeline')}</p>
          </div>
          <div className="space-y-4">
            {conversionRates.map((stage, index) => (
              <div key={stage.stage}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-[#16100A]">
                    {stage.stage === 'Leads' && t('reports.leads')}
                    {stage.stage === 'Contacted' && t('reports.contacted')}
                    {stage.stage === 'Interested' && t('reports.interested')}
                    {stage.stage === 'Converted' && t('reports.converted')}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#555555]">{stage.count}</span>
                    <span className="text-sm font-medium text-[#B5752A]">{stage.percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-[#F7F7F7] rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-[#B5752A] to-[#DDD68A]"
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 pt-6 border-t border-[#E5E5E5]">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-[#B5752A] mb-1">34%</p>
                <p className="text-xs text-[#555555]">{t('reports.overallConversion')}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#16100A] mb-1">48</p>
                <p className="text-xs text-[#555555]">{t('reports.totalConverted')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}