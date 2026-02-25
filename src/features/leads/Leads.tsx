import React, { useState } from 'react';
import { Plus, Search, Phone, Mail, User as UserIcon, Edit2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // ✅ البديل الصحيح
import { useConfigStore } from '../../store/useConfigStore'; // ✅ لجلب الاتجاه
import { useAuthStore } from '../../store/useAuthStore'; // ✅ لجلب الصلاحيات
import { LeadModal } from './components/LeadModal';

// ... (تأكد من وجود واجهة Lead ومصفوفة mockLeads فوق المكون)

export default function Leads() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any | null>(null);

  // ✅ تصحيح الاستدعاءات لتطابق مشروعك الحالي
  const { t, i18n } = useTranslation(['leads', 'common']); 
  const { dir } = useConfigStore(); 
  const { user } = useAuthStore();
  
  const isRTL = dir === 'rtl';
  const language = i18n.language; // ✅ تعريف المتغير المستخدم في الـ UI

  const canEdit = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'sales';

  interface Lead {
  id: string;
  name: string;
  nameAr: string;
  phone: string;
  email?: string;
  source: string;
  assignedTo: string;
  assignedToAr: string;
  status: 'New' | 'Contacted' | 'Interested' | 'Not Interested' | 'Converted';
  createdAt: string;
  notes?: string;
  notesAr?: string;
  interestedIn?: string;
  interestedInAr?: string;
}

const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Sarah Mohamed',
    nameAr: 'سارة محمد',
    phone: '+20 100 123 4567',
    email: 'sarah.m@email.com',
    source: 'Website',
    assignedTo: 'Esmaeil Mohamed',
    assignedToAr: 'إسماعيل محمد',
    status: 'New',
    createdAt: '2026-02-12',
    interestedIn: 'Apartment in Madinaty',
    interestedInAr: 'شقة في مدينتي'
  },
  {
    id: '2',
    name: 'Ahmed Khaled',
    nameAr: 'أحمد خالد',
    phone: '+20 111 234 5678',
    email: 'ahmed.k@email.com',
    source: 'Referral',
    assignedTo: 'Abdallah Elgamal',
    assignedToAr: 'عبدالله الجمال',
    status: 'Contacted',
    createdAt: '2026-02-11',
    interestedIn: 'Villa in Rehab',
    interestedInAr: 'فيلا في الرحاب',
    notes: 'Prefers ground floor',
    notesAr: 'يفضل الدور الأرضي'
  },
  {
    id: '3',
    name: 'Fatima Hassan',
    nameAr: 'فاطمة حسن',
    phone: '+20 122 345 6789',
    source: 'Facebook',
    assignedTo: 'Raghad',
    assignedToAr: 'رغد',
    status: 'Interested',
    createdAt: '2026-02-10',
    interestedIn: 'Commercial property',
    interestedInAr: 'عقار تجاري'
  },
  {
    id: '4',
    name: 'Omar Ibrahim',
    nameAr: 'عمر إبراهيم',
    phone: '+20 100 456 7890',
    email: 'omar.i@email.com',
    source: 'Walk-in',
    assignedTo: 'Noha',
    assignedToAr: 'نهى',
    status: 'Converted',
    createdAt: '2026-02-08',
    interestedIn: 'Apartment in Celia',
    interestedInAr: 'شقة في سيليا'
  },
  {
    id: '5',
    name: 'Nour Ahmed',
    nameAr: 'نور أحمد',
    phone: '+20 111 567 8901',
    source: 'Instagram',
    assignedTo: 'Mohamed Elbaze',
    assignedToAr: 'محمد الباز',
    status: 'Not Interested',
    createdAt: '2026-02-07',
    notes: 'Budget too low',
    notesAr: 'الميزانية منخفضة جداً'
  },
  {
    id: '6',
    name: 'Youssef Ali',
    nameAr: 'يوسف علي',
    phone: '+20 122 678 9012',
    email: 'youssef.a@email.com',
    source: 'Phone Call',
    assignedTo: 'Abdallah Elgamal',
    assignedToAr: 'عبدالله الجمال',
    status: 'Interested',
    createdAt: '2026-02-09',
    interestedIn: 'Villa in Madinaty',
    interestedInAr: 'فيلا في مدينتي'
  },
  {
    id: '7',
    name: 'Layla Mahmoud',
    nameAr: 'ليلى محمود',
    phone: '+20 100 789 0123',
    email: 'layla.m@email.com',
    source: 'Data Office',
    assignedTo: 'Raghad',
    assignedToAr: 'رغد',
    status: 'New',
    createdAt: '2026-02-13',
    interestedIn: 'Penthouse in New Cairo',
    interestedInAr: 'بنتهاوس في القاهرة الجديدة'
  },
  {
    id: '8',
    name: 'Hassan Elsayed',
    nameAr: 'حسن السيد',
    phone: '+20 111 890 1234',
    source: 'Data Office',
    assignedTo: 'Esmaeil Mohamed',
    assignedToAr: 'إسماعيل محمد',
    status: 'Contacted',
    createdAt: '2026-02-14',
    interestedIn: 'Duplex in October',
    interestedInAr: 'دوبلكس في أكتوبر',
    notes: 'Walk-in client from office',
    notesAr: 'عميل من المكتب'
  },
];
  // حساب العدادات المستخدمة في الـ UI
  const statusCounts: any = {
    all: mockLeads.length,
    New: mockLeads.filter(l => l.status === 'New').length,
    Contacted: mockLeads.filter(l => l.status === 'Contacted').length,
    Interested: mockLeads.filter(l => l.status === 'Interested').length,
    'Not Interested': mockLeads.filter(l => l.status === 'Not Interested').length,
    Converted: mockLeads.filter(l => l.status === 'Converted').length,
  };

  const filteredLeads = mockLeads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.nameAr.includes(searchTerm) ||
      lead.phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddLead = () => {
    setEditingLead(null);
    setModalOpen(true);
  };

  const handleEditLead = (lead: any) => {
    setEditingLead(lead);
    setModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Contacted': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Interested': return 'bg-green-50 text-green-700 border-green-200';
      case 'Converted': return 'bg-[#FEF3E2] text-[#B5752A] border-[#B5752A]';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // ✅ تعريف الدالة اللي المودال هينادي عليها لما نضغط "حفظ"
const handleSave = (data: Lead) => {
  if (editingLead) {
    // 📝 منطق التعديل: هنا ممكن تحدث مصفوفة الـ mockLeads أو تنادي على API
    console.log('Updating existing lead:', data);
  } else {
    // ✨ منطق الإضافة: إضافة عميل جديد
    console.log('Adding new lead:', data);
  }
  setModalOpen(false); // إغلاق المودال بعد الحفظ
};

  return (
    <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h1 className="text-2xl font-bold text-[#16100A] mb-2">{t('leads.title')}</h1>
            <p className="text-[#555555]">{t('leads.subtitle')}</p>
          </div>
          <button
            onClick={handleAddLead}
            className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all"
          >
            <Plus className="w-5 h-5" />
            {t('leads.addLead')}
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['all', 'New', 'Contacted', 'Interested', 'Not Interested', 'Converted'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                filterStatus === status
                  ? 'gradient-primary text-white'
                  : 'bg-white border border-[#E5E5E5] text-[#555555] hover:bg-[#F7F7F7]'
              }`}
            >
              {status === 'all' ? t('common:common.all') : t(`status.${status}` as any)} ({statusCounts[status]})
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
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`}
          />
        </div>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredLeads.map((lead) => (
          <div key={lead.id} className="bg-white rounded-lg border border-[#E5E5E5] p-6 hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {language === 'ar' ? lead.nameAr.charAt(0) : lead.name.charAt(0)}
                </div>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <h3 className="font-bold text-[#16100A]">{language === 'ar' ? lead.nameAr : lead.name}</h3>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium border mt-1 ${getStatusColor(lead.status)}`}>
                    {t(`status.${lead.status}` as any)}
                  </span>
                </div>
              </div>
              {canEdit && (
                <button
                  onClick={() => handleEditLead(lead)}
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
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#555555]">{t('leads.source')}</span>
                <span className="font-medium text-[#16100A]">{t(`source.${lead.source}` as any)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#555555]">{t('leads.assignedTo')}</span>
                <span className="font-medium text-[#16100A]">{language === 'ar' ? lead.assignedToAr : lead.assignedTo}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#555555]">{t('common:common.created')}</span>
                <span className="font-medium text-[#16100A]" dir="ltr">{new Date(lead.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
              </div>
            </div>

            {/* Interested In */}
            {lead.interestedIn && (
              <div className={`mt-4 pt-4 border-t border-[#E5E5E5] ${isRTL ? 'text-right' : 'text-left'}`}>
                <p className="text-xs text-[#555555] mb-1">{t('leads.interestedIn')}</p>
                <p className="text-sm font-medium text-[#16100A]">{language === 'ar' ? lead.interestedInAr : lead.interestedIn}</p>
              </div>
            )}

            {/* Notes */}
            {lead.notes && (
              <div className={`mt-4 pt-4 border-t border-[#E5E5E5] ${isRTL ? 'text-right' : 'text-left'}`}>
                <p className="text-xs text-[#555555] mb-1">{t('common:common.notes')}</p>
                <p className="text-sm text-[#16100A]">{language === 'ar' ? lead.notesAr : lead.notes}</p>
              </div>
            )}

            {/* Actions */}
            {canEdit && (
              <div className={`mt-4 pt-4 border-t border-[#E5E5E5] flex gap-2`}>
                <button
                  onClick={() => handleEditLead(lead)}
                  className="flex-1 px-3 py-2 bg-[#F7F7F7] text-[#555555] rounded-lg hover:bg-[#E5E5E5] transition-colors text-sm font-medium"
                >
                  {t('leads.updateStatus')}
                </button>
                <button className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lead Modal */}
      {modalOpen && (
  <LeadModal
    // ✅ الـ key ده هيخلي المودال يعمل Reset لنفسه كل ما العميل يتغير
    key={editingLead?.id || 'new'} 
    lead={editingLead}
    onClose={() => setModalOpen(false)}
    onSave={handleSave}
  />
)}
    </div>
  );
}
