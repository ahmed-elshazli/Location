import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../store/useConfigStore';
import { Building2, TrendingUp, Users, DollarSign, Target, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  useDashboardStats,
  useDashboardSales,
  useDashboardTopAreas,
  useDashboardTopAgents,
  useDashboardActivity,
} from './hooks/useDashboard';

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-[#F0F0F0] rounded ${className}`} />
);

const MONTH_AR: Record<string, string> = {
  Jan: 'يناير', Feb: 'فبراير', Mar: 'مارس',  Apr: 'أبريل',
  May: 'مايو',  Jun: 'يونيو',  Jul: 'يوليو', Aug: 'أغسطس',
  Sep: 'سبتمبر',Oct: 'أكتوبر',Nov: 'نوفمبر',Dec: 'ديسمبر',
};

export default function Dashboard() {
  const { t, i18n } = useTranslation('dashboard');
  const { dir }     = useConfigStore();
  const { user }    = useAuthStore();

  const isRTL = dir === 'rtl';
  const isAr  = i18n.language === 'ar';

  const { data: statsRaw,    isLoading: loadingStats    } = useDashboardStats();
  const { data: salesRaw,    isLoading: loadingSales    } = useDashboardSales();
  const { data: areasRaw,    isLoading: loadingAreas    } = useDashboardTopAreas();
  const { data: agentsRaw,   isLoading: loadingAgents   } = useDashboardTopAgents();
  const { data: activityRaw, isLoading: loadingActivity } = useDashboardActivity();

  if (!user) return (
    <div className="h-64 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#B5752A]" />
    </div>
  );

  // ── Normalize ─────────────────────────────────────────────────────────────
  const stats   = statsRaw?.data  || statsRaw  || {};
  const sales   = Array.isArray(salesRaw?.data  || salesRaw)  ? (salesRaw?.data  || salesRaw)  : [];
  const areas   = Array.isArray(areasRaw?.data  || areasRaw)  ? (areasRaw?.data  || areasRaw)  : [];
  const agents  = Array.isArray(agentsRaw?.data || agentsRaw) ? (agentsRaw?.data || agentsRaw) : [];
  const activities = Array.isArray(activityRaw?.data || activityRaw) ? (activityRaw?.data || activityRaw) : [];

  // ── Chart data ────────────────────────────────────────────────────────────
  const chartData = sales.map((s: any) => ({
    ...s,
    monthLabel: isAr ? (MONTH_AR[s.month] || s.month) : s.month,
  }));

  // max units for area bar percentage
  const maxUnits = areas.reduce((m: number, a: any) => Math.max(m, a.unitsSold || 0), 1);

  // ── Stat cards ────────────────────────────────────────────────────────────
  const formatRevenue = (v: number) =>
    v >= 1_000_000 ? (v / 1_000_000).toFixed(1) + 'M' : v?.toLocaleString() ?? '—';

  const statCards = [
    { icon: Building2,   val: stats.totalProperties ?? '—', label: isAr ? 'إجمالي العقارات'  : 'Total Properties', color: 'blue'    },
    { icon: CheckCircle, val: stats.availableUnits  ?? '—', label: isAr ? 'الوحدات المتاحة'  : 'Available Units',  color: 'green'   },
    { icon: TrendingUp,  val: stats.soldUnits       ?? '—', label: isAr ? 'الوحدات المباعة'  : 'Sold Units',       color: 'orange'  },
    { icon: Target,      val: stats.activeDeals     ?? '—', label: isAr ? 'الصفقات النشطة'   : 'Active Deals',     color: 'purple'  },
    { icon: Users,       val: stats.totalLeads      ?? '—', label: isAr ? 'إجمالي العملاء'   : 'Total Leads',      color: 'orange'  },
    { icon: DollarSign,  val: typeof stats.totalRevenue === 'number' ? formatRevenue(stats.totalRevenue) : '—',
                                                            label: isAr ? 'إجمالي الإيرادات' : 'Total Revenue',    color: 'emerald' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className={`mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
        <h1 className="text-2xl font-bold text-[#16100A] mb-2">
          {t('welcome') || 'Welcome'}, {user.name}
        </h1>
        <p className="text-[#555555]">{t('overview') || 'Dashboard Overview'}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map((item, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-[#E5E5E5] p-6">
            <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 bg-${item.color}-50 rounded-lg flex items-center justify-center`}>
                <item.icon className={`w-5 h-5 text-${item.color}-600`} />
              </div>
            </div>
            {loadingStats
              ? <Skeleton className="h-8 w-16 mb-2" />
              : <p className="text-2xl font-bold text-[#16100A] mb-1" dir="ltr">{item.val}</p>}
            <p className={`text-sm text-[#555555] ${isRTL ? 'text-right' : 'text-left'}`}>{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-[#E5E5E5] p-6">
          <div className={`mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h2 className="font-bold text-[#16100A] mb-1">{isAr ? 'نظرة عامة على المبيعات' : 'Sales Overview'}</h2>
            <p className="text-sm text-[#555555]">{isAr ? 'أداء المبيعات الشهري' : 'Monthly sales performance'}</p>
          </div>
          {loadingSales ? <Skeleton className="h-[280px] w-full" /> : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis dataKey="monthLabel" reversed={isRTL} style={{ fontSize: '12px' }} />
                <YAxis orientation={isRTL ? 'right' : 'left'} style={{ fontSize: '12px' }} />
                <Tooltip formatter={(val: any, name: string) => [val, name === 'totalDeals' ? (isAr ? 'الصفقات' : 'Deals') : (isAr ? 'الإيرادات' : 'Revenue')]} />
                <Line type="monotone" dataKey="totalDeals" stroke="#B5752A" strokeWidth={2} dot={{ fill: '#B5752A' }} name="totalDeals" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Areas */}
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
          <div className={`mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h2 className="font-bold text-[#16100A] mb-1">{isAr ? 'أفضل المناطق' : 'Top Areas'}</h2>
          </div>
          {loadingAreas ? (
            <div className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : (
            <div className="space-y-4">
              {areas.map((area: any) => {
                const pct = Math.round((area.unitsSold / maxUnits) * 100);
                return (
                  <div key={area.areaLocation}>
                    <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-sm font-medium">{area.areaLocation}</span>
                      <span className="text-sm text-[#555555]" dir="ltr">{area.unitsSold}</span>
                    </div>
                    <div className="w-full bg-[#F7F7F7] rounded-full h-2">
                      <div className="bg-[#B5752A] h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Agents */}
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
          <div className={`mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h2 className="font-bold text-[#16100A] mb-1">{isAr ? 'أفضل المبيعات' : 'Top Sales Agents'}</h2>
            <p className="text-sm text-[#555555]">{t('thisMonth') || 'This Month'}</p>
          </div>
          {loadingAgents ? (
            <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <div className="space-y-2">
              {agents.map((agent: any, index: number) => (
                <div key={agent.agentName || index}
                  className={`flex items-center gap-4 p-3 hover:bg-[#F7F7F7] rounded-lg transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <p className="font-medium text-[#16100A]">{agent.agentName}</p>
                    <p className="text-sm text-[#555555]" dir="ltr">
                      {agent.totalDeals} {isAr ? 'صفقة' : 'deals'} • EGP {formatRevenue(agent.totalRevenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
          <div className={`mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h2 className="font-bold text-[#16100A] mb-1">{t('recentActivity') || 'Recent Activity'}</h2>
            <p className="text-sm text-[#555555]">{isAr ? 'آخر التحديثات' : 'Latest updates'}</p>
          </div>
          {loadingActivity ? (
            <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <div className="space-y-4">
              {activities.map((act: any, idx: number) => {
                const timeAgo = act.createdAt
                  ? new Date(act.createdAt).toLocaleString(isAr ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : '';
                return (
                  <div key={act._id || idx}
                    className={`flex gap-3 pb-4 border-b border-[#F7F7F7] last:border-0 last:pb-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      act.type === 'deal' ? 'bg-green-500' :
                      act.type === 'unit' ? 'bg-purple-500' : 'bg-blue-500'
                    }`} />
                    <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <p className="text-sm font-medium text-[#16100A]">{act.message}</p>
                      <p className="text-xs text-[#555555] mt-1">{act.by} • {timeAgo}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}