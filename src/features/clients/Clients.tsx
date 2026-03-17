import { useState, useEffect } from 'react';
import { Plus, Search, Phone, Mail, MapPin, Calendar, Edit2, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../store/useConfigStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { useClients } from './hooks/useClients';
import { useCreateClient } from './hooks/useCreateClient';
import { useUpdateClient } from './hooks/useUpdateClient';
import { useDeleteClient } from './hooks/useDeleteClient';
import { ClientModal } from './components/ClientModal';
import { useNavigate } from 'react-router-dom';

export default function Clients() {
  const [searchTerm, setSearchTerm]       = useState('');
  const [keyword, setKeyword]             = useState('');
  const [currentPage, setCurrentPage]     = useState(1);
  const [modalOpen, setModalOpen]         = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [deleteConfig, setDeleteConfig]   = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false, id: '', name: ''
  });

  const { t, i18n }      = useTranslation(['clients', 'common']);
  const { dir }          = useConfigStore();
  const { user }         = useAuthStore();
  const { triggerToast } = useToastStore();

  const isRTL    = dir === 'rtl';
  const language = i18n.language;
  const navigate = useNavigate();

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setKeyword(searchTerm), 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Reset page on search change
  useEffect(() => { setCurrentPage(1); }, [keyword]);

  const { data: clientsData, isLoading } = useClients({
    page:    currentPage,
    keyword: keyword || undefined,
  });

  const clients    = Array.isArray(clientsData?.data) ? clientsData.data : [];
  const pagination = clientsData?.pagination;

  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const isReadOnly = user?.role === 'sales';

  const handleSave = (data: any) => {
    const options = {
      onSuccess: () => {
        triggerToast(editingClient ? "تم التحديث ✅" : "تمت الإضافة ✅", "success");
        setModalOpen(false);
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message;
        triggerToast(Array.isArray(msg) ? msg[0] : msg || "خطأ", "error");
      }
    };
    if (editingClient) {
      updateClient.mutate({ id: editingClient._id || editingClient.id, data }, options);
    } else {
      createClient.mutate(data, options);
    }
  };

  const confirmDelete = () => {
    deleteClient.mutate(deleteConfig.id, {
      onSuccess: () => {
        triggerToast("تم حذف العميل بنجاح 🗑️", "success");
        setDeleteConfig({ isOpen: false, id: '', name: '' });
      },
      onError: (err: any) => {
        triggerToast(err.response?.data?.message || "فشل الحذف", "error");
      }
    });
  };

  const getPageNumbers = () => {
    const total = pagination?.numberOfPages || 1;
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(total - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < total - 2) pages.push('...');
    pages.push(total);
    return pages;
  };

  if (isLoading && !clientsData) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B5752A]" />
      </div>
    );
  }

  return (
    <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h1 className="text-2xl font-bold text-[#16100A] mb-2">{t('clients.management')}</h1>
            <p className="text-[#555555]">{t('clients.managementSubtitle')}</p>
          </div>
          {!isReadOnly && (
            <button
              onClick={() => { setEditingClient(null); setModalOpen(true); }}
              className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all"
            >
              <Plus className="w-5 h-5" />
              {t('clients.addClient')}
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]`} />
          <input
            type="text"
            placeholder={t('clients.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
          <p className={`text-sm text-[#555555] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('clients.totalClients')}</p>
          <p className="text-2xl font-bold text-[#16100A]">{clientsData?.results || 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
          <p className={`text-sm text-[#555555] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('clients.totalDeals')}</p>
          <p className="text-2xl font-bold text-[#16100A]">
            {clients.reduce((sum: number, c: any) => sum + (c.deals || 0), 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
          <p className={`text-sm text-[#555555] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('clients.totalRevenue')}</p>
          <p className="text-2xl font-bold text-[#16100A]" dir="ltr">
            {(clients.reduce((sum: number, c: any) => sum + (c.totalSpent || 0), 0) / 1_000_000).toFixed(1)}{' '}
            {language === 'ar' ? 'مليون' : 'M'}
          </p>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {clients.map((client: any) => (
          <div key={client._id || client.id} className="bg-white rounded-xl border border-[#E5E5E5] p-5 hover:shadow-md transition-shadow">
            <div className={`flex items-start justify-between mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              <div className={`flex items-center gap-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                <div className="w-11 h-11 gradient-primary rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {client.fullName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <h3 className="font-bold text-[#16100A] text-base leading-tight">{client.fullName}</h3>
                  <p className="text-xs text-[#AAAAAA] mt-0.5">
                    {language === 'ar' ? 'رقم العميل:' : 'Client ID:'}{' '}
                    {(client._id || client.id)?.slice(-6)}
                  </p>
                </div>
              </div>
              {!isReadOnly && (
                <div className={`flex items-center gap-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <button onClick={() => { setEditingClient(client); setModalOpen(true); }}
                    className="p-1.5 hover:bg-[#F7F7F7] rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4 text-[#555555]" />
                  </button>
                  <button onClick={() => setDeleteConfig({ isOpen: true, id: client._id || client.id, name: client.fullName })}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-1.5 mb-4">
              {client.phone && (
                <div className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? 'text-right' : 'text-left'}`}>
                  <Phone className="w-3.5 h-3.5 flex-shrink-0 text-[#B5752A]" />
                  <span dir="ltr">{client.phone}</span>
                </div>
              )}
              {client.email && (
                <div className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? 'text-right' : 'text-left'}`}>
                  <Mail className="w-3.5 h-3.5 flex-shrink-0 text-[#B5752A]" />
                  <span dir="ltr" className="truncate">{client.email}</span>
                </div>
              )}
              {(client.city || client.country) && (
                <div className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? 'text-right' : 'text-left'}`}>
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#B5752A]" />
                  <span>{[client.city, client.country].filter(Boolean).join(', ')}</span>
                </div>
              )}
              {(client.clientSince || client.createdAt) && (
                <div className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? 'text-right' : 'text-left'}`}>
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-[#B5752A]" />
                  <span>
                    {language === 'ar' ? 'عميل منذ' : 'Client since'}{' '}
                    <span dir="ltr">
                      {new Date(client.clientSince || client.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {client.notes && (
              <div className={`mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                <p className="text-xs text-[#AAAAAA] mb-0.5">{language === 'ar' ? 'ملاحظات:' : 'Notes:'}</p>
                <p className="text-sm text-[#555555] line-clamp-2">{client.notes}</p>
              </div>
            )}

            <button
              onClick={() => navigate(`/clients/${client._id || client.id}`)}
              className="w-full py-2.5 gradient-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
            </button>
          </div>
        ))}

        {clients.length === 0 && (
          <div className="col-span-2 text-center py-16 text-[#AAAAAA]">
            <p>{language === 'ar' ? 'لا يوجد عملاء' : 'No clients found'}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className={`flex items-center justify-between mt-8 ${isRTL ? 'text-right' : 'text-left'}`}>
          <p className="text-sm text-[#555555]">
            {isRTL ? `إجمالي ${clientsData?.results || 0} عميل` : `Total ${clientsData?.results || 0} clients`}
          </p>
          {pagination.numberOfPages > 1 && (
            <div className={`flex items-center gap-1 ${isRTL ? 'text-right' : 'text-left'}`}>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-2 rounded-lg border border-[#E5E5E5] hover:bg-[#F7F7F7] disabled:opacity-40 transition-colors">
                {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
              {getPageNumbers().map((page, i) =>
                page === '...' ? (
                  <span key={`d${i}`} className="px-3 py-2 text-[#AAAAAA] text-sm">...</span>
                ) : (
                  <button key={page} onClick={() => setCurrentPage(page as number)}
                    className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors border ${
                      currentPage === page ? 'gradient-primary text-white border-transparent shadow-sm' : 'border-[#E5E5E5] text-[#555555] hover:bg-[#F7F7F7]'
                    }`}>
                    {page}
                  </button>
                )
              )}
              <button onClick={() => setCurrentPage(p => Math.min(pagination.numberOfPages, p + 1))} disabled={currentPage === pagination.numberOfPages}
                className="p-2 rounded-lg border border-[#E5E5E5] hover:bg-[#F7F7F7] disabled:opacity-40 transition-colors">
                {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          )}
          <p className="text-sm text-[#555555]">
            {isRTL ? `صفحة ${pagination.currentPage} من ${pagination.numberOfPages}` : `Page ${pagination.currentPage} of ${pagination.numberOfPages}`}
          </p>
        </div>
      )}

      {/* Delete Modal */}
      {deleteConfig.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-[#16100A] mb-2">{t('common:common.confirmDelete')}</h3>
              <p className="text-[#555555] mb-6">
                {isRTL
                  ? `هل أنت متأكد من حذف العميل "${deleteConfig.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`
                  : `Are you sure you want to delete "${deleteConfig.name}"? This action cannot be undone.`}
              </p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setDeleteConfig({ isOpen: false, id: '', name: '' })}
                  className="flex-1 px-4 py-2 border border-[#E5E5E5] rounded-lg text-[#555555] hover:bg-[#F7F7F7] font-medium transition-colors">
                  {t('common:common.cancel')}
                </button>
                <button onClick={confirmDelete} disabled={deleteClient.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold transition-colors disabled:opacity-50">
                  {deleteClient.isPending ? '...' : t('common:common.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client Modal */}
      {modalOpen && (
        <ClientModal
          client={editingClient}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          isLoading={createClient.isPending || updateClient.isPending}
        />
      )}
    </div>
  );
}