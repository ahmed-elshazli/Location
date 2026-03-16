import React, { useState, useEffect } from 'react';
import { Plus, Search, Phone, Mail, Edit2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../store/useConfigStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { useLeads } from './hooks/useLeads';
import { useCreateLead } from './hooks/useCreateLead';
import { useUpdateLead } from './hooks/useUpdateLead';
import { useDeleteLead } from './hooks/useDeleteLead';
import { LeadModal } from './components/LeadModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Leads() {
  const [searchTerm, setSearchTerm]     = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [modalOpen, setModalOpen]       = useState(false);
  const [editingLead, setEditingLead]   = useState<any | null>(null);
  const [currentPage, setCurrentPage]   = useState(1);
  const [deleteConfig, setDeleteConfig] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false, id: '', name: ''
  });

  const { t, i18n }      = useTranslation(['leads', 'common']);
  const { dir }          = useConfigStore();
  const { user }         = useAuthStore();
  const { triggerToast } = useToastStore();

  const isRTL    = dir === 'rtl';
  const language = i18n.language;
  const isReadOnly = user?.role === 'sales';

  // Debounce search
  const [keyword, setKeyword] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setKeyword(searchTerm), 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Reset page on filter/search change
  useEffect(() => { setCurrentPage(1); }, [keyword, filterStatus]);

  // ── API ──────────────────────────────────────────────────────────────────
  const { data: leadsData, isLoading } = useLeads({
    page:    currentPage,
    limit:   10,
    keyword: keyword || undefined,
    status:  filterStatus !== 'all' ? filterStatus : undefined,
  });

  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();

  const leadList: any[] = Array.isArray(leadsData?.data) ? leadsData.data
    : Array.isArray(leadsData)                           ? leadsData
    : [];

  const pagination = leadsData?.pagination;
  const totalPages = pagination?.numberOfPages ?? 1;

  // Status counts from current page data
  const statusCounts: any = {
    all:            leadsData?.results ?? leadList.length,
    NEW:            leadList.filter(l => l.status === 'NEW').length,
    CONTACTED:      leadList.filter(l => l.status === 'CONTACTED').length,
    INTERESTED:     leadList.filter(l => l.status === 'INTERESTED').length,
    NOT_INTERESTED: leadList.filter(l => l.status === 'NOT_INTERESTED').length,
    CONVERTED:      leadList.filter(l => l.status === 'CONVERTED').length,
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSave = (data: any) => {
    if (editingLead) {
      updateLead.mutate(
        { id: editingLead._id || editingLead.id, data },
        {
          onSuccess: () => {
            triggerToast(language === 'ar' ? 'تم التحديث ✅' : 'Updated successfully ✅', 'success');
            setModalOpen(false);
            setEditingLead(null);
          },
          onError: (err: any) => {
            const msg = err.response?.data?.message;
            triggerToast(Array.isArray(msg) ? msg[0] : msg || 'حدث خطأ', 'error');
          },
        }
      );
    } else {
      createLead.mutate(data, {
        onSuccess: () => {
          triggerToast(language === 'ar' ? 'تمت الإضافة 🚀' : 'Lead created 🚀', 'success');
          setModalOpen(false);
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message;
          triggerToast(Array.isArray(msg) ? msg[0] : msg || 'حدث خطأ', 'error');
        },
      });
    }
  };

  const confirmDelete = () => {
    deleteLead.mutate(deleteConfig.id, {
      onSuccess: () => {
        triggerToast(language === 'ar' ? 'تم الحذف ✅' : 'Deleted successfully ✅', 'success');
        setDeleteConfig({ isOpen: false, id: '', name: '' });
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message;
        triggerToast(Array.isArray(msg) ? msg[0] : msg || 'حدث خطأ', 'error');
        setDeleteConfig({ isOpen: false, id: '', name: '' });
      },
    });
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':            return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CONTACTED':      return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'INTERESTED':     return 'bg-green-50 text-green-700 border-green-200';
      case 'CONVERTED':      return 'bg-[#FEF3E2] text-[#B5752A] border-[#B5752A]';
      case 'NOT_INTERESTED': return 'bg-red-50 text-red-600 border-red-200';
      default:               return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'NEW':            return language === 'ar' ? 'جديد'           : 'New';
      case 'CONTACTED':      return language === 'ar' ? 'تم التواصل'     : 'Contacted';
      case 'INTERESTED':     return language === 'ar' ? 'مهتم'           : 'Interested';
      case 'CONVERTED':      return language === 'ar' ? 'تحول لعميل'     : 'Converted';
      case 'NOT_INTERESTED': return language === 'ar' ? 'غير مهتم'       : 'Not Interested';
      default:               return status;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'WEBSITE':     return language === 'ar' ? 'الموقع'        : 'Website';
      case 'REFERRAL':    return language === 'ar' ? 'إحالة'         : 'Referral';
      case 'FACEBOOK':    return language === 'ar' ? 'فيسبوك'        : 'Facebook';
      case 'INSTAGRAM':   return language === 'ar' ? 'إنستجرام'      : 'Instagram';
      case 'PHONE_CALL':  return language === 'ar' ? 'مكالمة هاتفية' : 'Phone Call';
      case 'WALK_IN':     return language === 'ar' ? 'زيارة مباشرة'  : 'Walk-in';
      case 'DATA_OFFICE': return language === 'ar' ? 'مكتب البيانات' : 'Data Office';
      default:            return source;
    }
  };

  if (isLoading && !leadsData) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B5752A]" />
      </div>
    );
  }

  const statuses = ['all', 'NEW', 'CONTACTED', 'INTERESTED', 'NOT_INTERESTED', 'CONVERTED'] as const;

  return (
    <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Header */}
      <div className="mb-6">
        <div className={`flex items-center justify-between mb-6  `} >
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h1 className="text-2xl font-bold text-[#16100A] mb-2">{t('leads.title')}</h1>
            <p className="text-[#555555]">{t('leads.subtitle')}</p>
          </div>
          {!isReadOnly && (
            <button
              onClick={() => { setEditingLead(null); setModalOpen(true); }}
              className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all"
            >
              <Plus className="w-5 h-5" />
              {t('leads.addLead')}
            </button>
          )}
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {statuses.map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all text-sm font-medium ${
                filterStatus === status
                  ? 'gradient-primary text-white'
                  : 'bg-white border border-[#E5E5E5] text-[#555555] hover:bg-[#F7F7F7]'
              }`}
            >
              {status === 'all' ? (language === 'ar' ? 'الكل' : 'All') : getStatusLabel(status)}{' '}
              ({statusCounts[status] ?? 0})
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]`} />
          <input
            type="text"
            placeholder={t('leads.searchPlaceholder')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`}
          />
        </div>
      </div>

      {/* Leads Grid */}
      {leadList.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-16 text-center text-[#AAAAAA]">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{language === 'ar' ? 'لا توجد نتائج' : 'No leads found'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {leadList.map(lead => (
            <div key={lead._id || lead.id} className="bg-white rounded-lg border border-[#E5E5E5] p-6 hover:shadow-lg transition-shadow">

              {/* Card Header */}
              <div className={`flex items-start justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                    {(lead.fullName || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <h3 className="font-bold text-[#16100A]">{lead.fullName}</h3>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium border mt-1 ${getStatusColor(lead.status)}`}>
                      {getStatusLabel(lead.status)}
                    </span>
                  </div>
                </div>
                {!isReadOnly && (
                  <button
                    onClick={() => { setEditingLead(lead); setModalOpen(true); }}
                    className="p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-[#555555]" />
                  </button>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span dir="ltr">{lead.phone}</span>
                </div>
                {lead.email && (
                  <div className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span dir="ltr">{lead.email}</span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-2 pt-4 border-t border-[#E5E5E5]">
                {lead.source && (
                  <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[#555555]">{t('leads.source')}</span>
                    <span className="font-medium text-[#16100A]">{getSourceLabel(lead.source)}</span>
                  </div>
                )}
                {lead.assignedTo && (
                  <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[#555555]">{t('leads.assignedTo')}</span>
                    <span className="font-medium text-[#16100A]">
                      {typeof lead.assignedTo === 'object'
                        ? (lead.assignedTo?.fullName || lead.assignedTo?.name || '')
                        : lead.assignedTo}
                    </span>
                  </div>
                )}
                <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-[#555555]">{t('common:common.created')}</span>
                  <span className="font-medium text-[#16100A]" dir="ltr">
                    {new Date(lead.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                  </span>
                </div>
              </div>

              {lead.interestedIn && (
                <div className={`mt-4 pt-4 border-t border-[#E5E5E5] ${isRTL ? 'text-right' : 'text-left'}`}>
                  <p className="text-xs text-[#555555] mb-1">{t('leads.interestedIn')}</p>
                  <p className="text-sm font-medium text-[#16100A]">{lead.interestedIn}</p>
                </div>
              )}

              {lead.notes && (
                <div className={`mt-4 pt-4 border-t border-[#E5E5E5] ${isRTL ? 'text-right' : 'text-left'}`}>
                  <p className="text-xs text-[#555555] mb-1">{t('common:common.notes')}</p>
                  <p className="text-sm text-[#16100A]">{lead.notes}</p>
                </div>
              )}

              {!isReadOnly && (
                <div className={`mt-4 pt-4 border-t border-[#E5E5E5] flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <button
                    onClick={() => { setEditingLead(lead); setModalOpen(true); }}
                    className="flex-1 px-3 py-2 bg-[#F7F7F7] text-[#555555] rounded-lg hover:bg-[#E5E5E5] transition-colors text-sm font-medium"
                  >
                    {t('leads.updateStatus')}
                  </button>
                  <button
                    onClick={() => setDeleteConfig({ isOpen: true, id: lead._id || lead.id, name: lead.fullName })}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
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
            const isFirst = page === 1;
            const isLast  = page === totalPages;
            const isNear  = Math.abs(page - currentPage) <= 1;
            if (!isFirst && !isLast && !isNear) {
              if (page === 2 || page === totalPages - 1) return <span key={page} className="text-[#555555] text-sm px-1">...</span>;
              return null;
            }
            return (
              <button key={page} onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  page === currentPage ? 'gradient-primary text-white shadow-sm' : 'border border-[#E5E5E5] text-[#555555] hover:bg-[#F7F7F7]'
                }`}
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

      {/* Lead Modal */}
      {modalOpen && (
        <LeadModal
          key={editingLead?._id || editingLead?.id || 'new'}
          lead={editingLead}
          onClose={() => { setModalOpen(false); setEditingLead(null); }}
          onSave={handleSave}
          isLoading={createLead.isPending || updateLead.isPending}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfig.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-[#16100A] text-center mb-2">
              {language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
            </h3>
            <p className="text-[#555555] text-center text-sm mb-6">
              {language === 'ar'
                ? `هل أنت متأكد من حذف "${deleteConfig.name}"؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete "${deleteConfig.name}"? This action cannot be undone.`}
            </p>
            <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button onClick={confirmDelete} disabled={deleteLead.isPending}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50">
                {deleteLead.isPending ? '...' : (language === 'ar' ? 'حذف' : 'Delete')}
              </button>
              <button onClick={() => setDeleteConfig({ isOpen: false, id: '', name: '' })}
                className="flex-1 bg-[#F7F7F7] text-[#555555] py-2.5 rounded-lg hover:bg-[#E5E5E5] transition-colors font-medium">
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}