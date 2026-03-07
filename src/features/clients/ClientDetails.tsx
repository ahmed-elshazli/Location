import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ChevronRight, Edit2, Trash2,
  Phone, Mail, MapPin, Calendar,
  Handshake, DollarSign, Home, FileText,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../store/useConfigStore';
import { useToastStore } from '../../store/useToastStore';
import { useClientById } from './hooks/useClientById';
import { useClientAnalytics } from './hooks/useClientAnalytics';
import { useDeleteClient } from './hooks/useDeleteClient';
import { ClientModal } from './components/ClientModal';
import { DealModal } from '../deals/components/DealModal';

interface ClientDetailsProps {
  clientId: string;
  onBack: () => void;
}

export default function ClientDetails({ clientId, onBack }: ClientDetailsProps) {
  const { t, i18n }      = useTranslation(['clients', 'common', 'properties']);
  const { dir }          = useConfigStore();
  const { triggerToast } = useToastStore();

  const isRTL    = dir === 'rtl';
  const language = i18n.language;

  const { data: clientData, isLoading, isError } = useClientById(clientId);
  const { data: analyticsData } = useClientAnalytics(clientId);

  // الباك ممكن يرجع { data: {...} } أو الـ object مباشرةً
  const client    = clientData?.data || clientData;
  const analytics = analyticsData?.data || analyticsData;

  // ✅ Stats من analytics لو موجودة، fallback على client data
  const totalDeals      = analytics?.totalDeals      ?? client?.deals          ?? 0;
  const totalSpent      = analytics?.totalSpent      ?? client?.totalSpent     ?? 0;
  const totalProperties = analytics?.totalProperties ?? client?.properties?.length ?? 0;

  const deleteClient = useDeleteClient();
  const navigate     = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen,   setEditOpen]   = useState(false);

  const handleConfirmDelete = () => {
    deleteClient.mutate(clientId, {
      onSuccess: () => {
        triggerToast('تم حذف العميل بنجاح 🗑️', 'success');
        onBack();
      },
      onError: (err: any) => {
        triggerToast(err.response?.data?.message || 'فشل الحذف', 'error');
      },
    });
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B5752A]" />
      </div>
    );
  }

  if (isError || !client) {
    return (
      <div className="h-64 flex items-center justify-center text-[#555555]">
        <p>{language === 'ar' ? 'فشل تحميل بيانات العميل' : 'Failed to load client data'}</p>
      </div>
    );
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  const InfoRow = ({ icon: Icon, label, value, ltr = false }: any) => (
    <div className={`flex items-center gap-3 p-3 bg-[#FAFAFA] rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
      <Icon className="w-5 h-5 text-[#B5752A] flex-shrink-0" />
      <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
        <p className="text-xs text-[#555555] mb-0.5">{label}</p>
        <p className="font-medium text-[#16100A]" dir={ltr ? 'ltr' : undefined}>{value}</p>
      </div>
    </div>
  );

  const StatCard = ({ icon: Icon, label, value }: any) => (
    <div className={`p-4 bg-gradient-to-br from-[#FEF3E2] to-[#FCF8E8] rounded-lg ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Icon className="w-5 h-5 text-[#B5752A]" />
        <p className="text-sm text-[#555555]">{label}</p>
      </div>
      <p className="text-2xl font-bold text-[#B5752A]">{value}</p>
    </div>
  );

  return (
    <div className="min-h-full bg-[#FAFAFA]" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── Sticky Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#E5E5E5] sticky top-0 z-10">
        <div className="p-6">
          {/* Top row */}
          <div className={`flex items-center justify-between mb-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={onBack}
              className={`flex items-center gap-2 text-[#555555] hover:text-[#B5752A] transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              {isRTL ? <ChevronRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
              <span className="font-medium">{t('clients.backToList')}</span>
            </button>

            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => setEditOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#F7F7F7] hover:bg-[#E5E5E5] rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4 text-[#555555]" />
                <span className="text-sm font-medium text-[#555555]">{t('common:common.edit')}</span>
              </button>
              <button
                onClick={() => setDeleteOpen(true)}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5 text-red-600" />
              </button>
            </div>
          </div>

          {/* Client identity */}
          <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
              {client.fullName?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
              <h1 className="text-2xl font-bold text-[#16100A] mb-1">{client.fullName}</h1>
              <p className="text-sm text-[#555555] mb-3">
                {language === 'ar' ? 'رقم العميل:' : 'Client ID:'} {clientId.slice(-6)}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                  {language === 'ar' ? 'عميل نشط' : 'Active Client'}
                </span>
                {client.deals > 0 && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    {client.deals} {t('clients.deals')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left / Main ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Contact Info */}
            <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
              <h2 className={`text-lg font-bold text-[#16100A] mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('clients.contactInfo')}
              </h2>
              <div className="space-y-3">
                {client.phone && (
                  <InfoRow icon={Phone} label={t('clients.phone')} value={client.phone} ltr />
                )}
                {client.email && (
                  <InfoRow icon={Mail} label={t('clients.email')} value={client.email} ltr />
                )}
                {(client.city || client.country) && (
                  <InfoRow
                    icon={MapPin}
                    label={language === 'ar' ? 'الموقع' : 'Location'}
                    value={[client.city, client.country].filter(Boolean).join(', ')}
                  />
                )}
                {(client.clientSince || client.createdAt) && (
                  <InfoRow
                    icon={Calendar}
                    label={t('clients.clientSince')}
                    value={new Date(client.clientSince || client.createdAt).toLocaleDateString(
                      language === 'ar' ? 'ar-EG' : 'en-US',
                      { year: 'numeric', month: 'long', day: 'numeric' }
                    )}
                    ltr
                  />
                )}
              </div>
            </div>

            {/* Recent Deals — لو الباك رجعهم */}
            {client.recentDeals?.length > 0 && (
              <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
                <h2 className={`text-lg font-bold text-[#16100A] mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('clients.recentDeals')}
                </h2>
                <div className="space-y-3">
                  {client.recentDeals.map((deal: any) => (
                    <div key={deal._id || deal.id} className={`p-4 bg-[#FAFAFA] rounded-lg ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div className={`flex items-start justify-between mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <p className="font-semibold text-[#16100A] text-sm">
                          {deal.title || deal.unit?.unitCode || '---'}
                        </p>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          {deal.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#555555] mb-1" dir="ltr">
                        {deal.createdAt ? new Date(deal.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : ''}
                      </p>
                      <p className="font-bold text-[#B5752A]" dir="ltr">
                        {deal.value?.toLocaleString()} {language === 'ar' ? 'ج.م' : 'EGP'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {client.notes && (
              <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
                <h2 className={`text-lg font-bold text-[#16100A] mb-3 flex items-center gap-2 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <FileText className="w-5 h-5 text-[#B5752A]" />
                  {t('common:common.notes')}
                </h2>
                <p className={`text-[#555555] leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
                  {client.notes}
                </p>
              </div>
            )}
          </div>

          {/* ── Right / Sidebar ──────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Stats */}
            <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
              <h3 className={`font-semibold text-[#16100A] mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('clients.summary')}
              </h3>
              <div className="space-y-3">
                <StatCard
                  icon={Handshake}
                  label={t('clients.totalDeals')}
                  value={totalDeals}
                />
                <StatCard
                  icon={DollarSign}
                  label={t('clients.totalSpent')}
                  value={
                    totalSpent
                      ? `${(totalSpent / 1_000_000).toFixed(1)} ${language === 'ar' ? 'م ج.م' : 'M EGP'}`
                      : '—'
                  }
                />
                <StatCard
                  icon={Home}
                  label={t('clients.totalProperties')}
                  value={totalProperties}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
              <h3 className={`font-semibold text-[#16100A] mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('clients.quickActions')}
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/deals')}
                  className="w-full py-2.5 px-4 bg-[#F7F7F7] hover:bg-[#E5E5E5] rounded-lg transition-colors text-[#16100A] text-sm font-medium"
                >
                  {t('clients.createNewDeal')}
                </button>
                <button className="w-full py-2.5 px-4 bg-[#F7F7F7] hover:bg-[#E5E5E5] rounded-lg transition-colors text-[#16100A] text-sm font-medium">
                  {t('clients.scheduleCall')}
                </button>
                {client.email && (
                  <a
                    href={`mailto:${client.email}`}
                    className="block w-full py-2.5 px-4 bg-[#F7F7F7] hover:bg-[#E5E5E5] rounded-lg transition-colors text-[#16100A] text-sm font-medium text-center"
                  >
                    {t('clients.sendEmail')}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Delete Confirm Modal ───────────────────────────────────────────── */}
      {deleteOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-[#16100A] mb-2">{t('common:common.confirmDelete')}</h3>
              <p className="text-[#555555] mb-6">
                {isRTL
                  ? `هل أنت متأكد من حذف العميل "${client.fullName}"؟ هذا الإجراء لا يمكن التراجع عنه.`
                  : `Are you sure you want to delete "${client.fullName}"? This action cannot be undone.`}
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDeleteOpen(false)}
                  className="flex-1 px-4 py-2 border border-[#E5E5E5] rounded-lg text-[#555555] hover:bg-[#F7F7F7] font-medium"
                >
                  {t('common:common.cancel')}
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteClient.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold disabled:opacity-50"
                >
                  {deleteClient.isPending ? '...' : t('common:common.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ────────────────────────────────────────────────────── */}
      {editOpen && (
        <ClientModal
          client={client}
          onClose={() => setEditOpen(false)}
          onSave={(data: any) => {
            // الـ parent هيتعامل مع الـ update
            setEditOpen(false);
          }}
          isLoading={false}
        />
      )}
    </div>
  );
}