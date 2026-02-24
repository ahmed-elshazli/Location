import React, { useState } from 'react';
import { Plus, Search, Phone, Mail, MapPin, Calendar, Handshake, Edit2 } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // ✅ البديل الصحيح
import { useConfigStore } from '../../store/useConfigStore'; // ✅ لجلب الاتجاه
import { useAuthStore } from '../../store/useAuthStore'; // ✅ لجلب بيانات المستخدم
import { ImageWithFallback } from './components/ImageWithFallback';

// ... (واجهة Client ومصفوفة mockClients تبقى كما هي تماماً)
interface Client {
  id: string;
  name: string;
  nameAr: string;
  phone: string;
  email?: string;
  address?: string;
  addressAr?: string;
  joinedDate: string;
  deals: number;
  totalSpent: number;
  properties: string[];
  propertiesAr: string[];
  notes?: string;
  notesAr?: string;
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'Ahmed Khaled',
    nameAr: 'أحمد خالد',
    phone: '+20 100 123 4567',
    email: 'ahmed.k@email.com',
    address: 'Cairo, Egypt',
    addressAr: 'القاهرة، مصر',
    joinedDate: '2025-08-15',
    deals: 2,
    totalSpent: 12000000,
    properties: ['Villa B1-034, Madinaty', 'Apartment 156, Celia'],
    propertiesAr: ['فيلا B1-034، مدينتي', 'شقة 156، سيليا'],
    notes: 'VIP client, prefers villas',
    notesAr: 'عميل VIP، يفضل الفلل'
  },
  {
    id: '2',
    name: 'Sarah Mohamed',
    nameAr: 'سارة محمد',
    phone: '+20 111 234 5678',
    email: 'sarah.m@email.com',
    address: 'Giza, Egypt',
    addressAr: 'الجيزة، مصر',
    joinedDate: '2025-09-20',
    deals: 1,
    totalSpent: 2500000,
    properties: ['Apartment 45, Rehab'],
    propertiesAr: ['شقة 45، الرحاب'],
  },
  {
    id: '3',
    name: 'Youssef Ali',
    nameAr: 'يوسف علي',
    phone: '+20 122 345 6789',
    email: 'youssef.a@email.com',
    address: 'Alexandria, Egypt',
    addressAr: 'الإسكندرية، مصر',
    joinedDate: '2025-10-10',
    deals: 1,
    totalSpent: 9200000,
    properties: ['Villa B3-023, Madinaty'],
    propertiesAr: ['فيلا B3-023، مدينتي'],
  },
  {
    id: '4',
    name: 'Fatima Hassan',
    nameAr: 'فاطمة حسن',
    phone: '+20 100 456 7890',
    email: 'fatima.h@email.com',
    joinedDate: '2025-11-05',
    deals: 1,
    totalSpent: 5500000,
    properties: ['Commercial COM-012, Thousand'],
    propertiesAr: ['وحدة تجارية COM-012، ألف'],
    notes: 'Interested in commercial properties',
    notesAr: 'مهتمة بالعقارات التجارية'
  },
  {
    id: '5',
    name: 'Omar Ibrahim',
    nameAr: 'عمر إبراهيم',
    phone: '+20 111 567 8901',
    email: 'omar.i@email.com',
    address: 'Cairo, Egypt',
    addressAr: 'القاهرة، مصر',
    joinedDate: '2026-01-12',
    deals: 1,
    totalSpent: 3200000,
    properties: ['Apartment 156, Celia'],
    propertiesAr: ['شقة 156، سيليا'],
  },
  {
    id: '6',
    name: 'Nour Ahmed',
    nameAr: 'نور أحمد',
    phone: '+20 122 678 9012',
    email: 'nour.a@email.com',
    address: 'New Cairo, Egypt',
    addressAr: 'القاهرة الجديدة، مصر',
    joinedDate: '2026-02-01',
    deals: 1,
    totalSpent: 11000000,
    properties: ['Villa B6-078, Madinaty'],
    propertiesAr: ['فيلا B6-078، مدينتي'],
  },
];

export default function Clients() { // ✅ جعلناه Default Export لحل مشكلة الـ Lazy Loading
  const [searchTerm, setSearchTerm] = useState('');
  
  // ✅ ربط المتغيرات بالسيستم الجديد لضمان استقرار الصفحة
  const { t, i18n } = useTranslation(['clients', 'common', 'deals']); 
  const { dir } = useConfigStore(); 
  const { user } = useAuthStore();
  
  const isRTL = dir === 'rtl'; 
  const language = i18n.language;

  // --- الحفاظ على منطق الفلترة كما هو حرفياً ---
  const filteredClients = mockClients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.nameAr.includes(searchTerm) ||
      client.phone.includes(searchTerm) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h1 className="text-2xl font-bold text-[#16100A] mb-2">{t('clients.management')}</h1>
            <p className="text-[#555555]">{t('clients.managementSubtitle')}</p>
          </div>
          <button className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all">
            <Plus className="w-5 h-5" />
            {t('clients.addClient')}
          </button>
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
          <p className="text-2xl font-bold text-[#16100A]">{mockClients.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
          <p className={`text-sm text-[#555555] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('clients.totalDeals')}</p>
          <p className="text-2xl font-bold text-[#16100A]">{mockClients.reduce((sum, c) => sum + c.deals, 0)}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
          <p className={`text-sm text-[#555555] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('clients.totalRevenue')}</p>
          <p className="text-2xl font-bold text-[#16100A]" dir="ltr">{(mockClients.reduce((sum, c) => sum + c.totalSpent, 0) / 1000000).toFixed(1)} {language === 'ar' ? 'مليون' : 'M'}</p>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredClients.map((client) => (
          <div key={client.id} className="bg-white rounded-lg border border-[#E5E5E5] p-6 hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
                  {language === 'ar' ? client.nameAr.charAt(0) : client.name.charAt(0)}
                </div>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <h3 className="font-bold text-[#16100A]">{language === 'ar' ? client.nameAr : client.name}</h3>
                  <p className="text-sm text-[#555555]">{t('clients.clientId')}: {client.id}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors">
                <Edit2 className="w-4 h-4 text-[#555555]" />
              </button>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span dir="ltr">{client.phone}</span>
              </div>
              {client.email && (
                <div className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span dir="ltr">{client.email}</span>
                </div>
              )}
              {client.address && (
                <div className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>{language === 'ar' ? client.addressAr : client.address}</span>
                </div>
              )}
              <div className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>{t('clients.clientSince')} <span dir="ltr">{new Date(client.joinedDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</span></span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-[#E5E5E5]">
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-xs text-[#555555] mb-1">{t('clients.totalDeals')}</p>
                <p className="font-bold text-[#16100A]">{client.deals}</p>
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className="text-xs text-[#555555] mb-1">{t('deals.value')}</p>
                <p className="font-bold text-[#B5752A]" dir="ltr">{(client.totalSpent / 1000000).toFixed(1)} {language === 'ar' ? 'مليون جنيه' : 'M EGP'}</p>
              </div>
            </div>

            {/* Properties */}
            <div className={`mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              <p className="text-sm font-medium text-[#16100A] mb-2">{t('clients.propertiesOwned')}:</p>
              <div className="space-y-1">
                {(language === 'ar' ? client.propertiesAr : client.properties).map((property, idx) => (
                  <p key={idx} className={`text-sm text-[#555555] ${isRTL ? 'pr-4' : 'pl-4'}`}>• {property}</p>
                ))}
              </div>
            </div>

            {/* Notes */}
            {client.notes && (
              <div className={`pt-4 border-t border-[#E5E5E5] ${isRTL ? 'text-right' : 'text-left'}`}>
                <p className="text-xs text-[#555555] mb-1">{t('common.notes')}:</p>
                <p className="text-sm text-[#16100A]">{language === 'ar' ? client.notesAr : client.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}