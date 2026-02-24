import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next'; //
import { useConfigStore } from '../../../store/useConfigStore'; //

interface Lead {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  source: string;
  assignedTo: string;
  status: 'New' | 'Contacted' | 'Interested' | 'Not Interested' | 'Converted';
  notes?: string;
  interestedIn?: string;
}

interface LeadModalProps {
  lead: Lead | null;
  onClose: () => void;
  onSave: (data: any) => void;
}

// القوائم الثابتة المطلوبة للـ UI
const sources = ['Website', 'Facebook', 'Instagram', 'Referral', 'Walk-in', 'Phone Call', 'Data Office', 'Other'];
const salesAgents = ['Abdallah Elgamal', 'Esmaeil Mohamed', 'Raghad', 'Noha', 'Mohamed Elbaze'];

export function LeadModal({ lead, onClose, onSave }: LeadModalProps) {
  // ✅ جلب الإعدادات والترجمة من السيستم بتاعنا
  const { t } = useTranslation(['leads', 'common']); 
  const { dir } = useConfigStore(); 
  const isRTL = dir === 'rtl';

  // ✅ إدارة حالة الفورم
  // 1. تعريف الحالة مع تحديد النوع (Interface) لضمان قبول كل الحالات
const [formData, setFormData] = useState<Lead>(() => ({
    name: lead?.name || '',
    phone: lead?.phone || '',
    email: lead?.email || '',
    source: lead?.source || 'Website',
    assignedTo: lead?.assignedTo || 'Abdallah Elgamal',
    status: lead?.status || 'New', // ✅ تم تصحيح الـ Syntax Error هنا
    notes: lead?.notes || '',
    interestedIn: lead?.interestedIn || '',
  }));



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className={`sticky top-0 bg-white border-b border-[#E5E5E5] px-6 py-4 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h2 className="font-bold text-[#16100A]">
            {/* ✅ تحديث نداء الترجمة فقط ليعمل مع نظام الـ Namespaces */}
            {lead ? t('leads:editLead') : t('leads:addNewLead')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#555555]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('leads.fullName')} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626] ${isRTL ? 'text-right' : 'text-left'}`}
                placeholder={t('leads.fullName')}
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('leads.phoneNumber')} *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626] ${isRTL ? 'text-right' : 'text-left'}`}
                placeholder="+20 100 123 4567"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('leads.emailAddress')}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626] ${isRTL ? 'text-right' : 'text-left'}`}
                placeholder="email@example.com"
              />
            </div>

            {/* Source */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('leads.source')} *
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className={`w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626] ${isRTL ? 'text-right' : 'text-left'}`}
                required
              >
                {sources.map(source => (
                  <option key={source} value={source}>{t(`source.${source}` as any)}</option>
                ))}
              </select>
            </div>

            {/* Assigned To */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('leads.assignTo')} *
              </label>
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className={`w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626] ${isRTL ? 'text-right' : 'text-left'}`}
                required
              >
                {salesAgents.map(agent => (
                  <option key={agent} value={agent}>{agent}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('common.status')} *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className={`w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626] ${isRTL ? 'text-right' : 'text-left'}`}
                required
              >
                <option value="New">{t('status.New')}</option>
                <option value="Contacted">{t('status.Contacted')}</option>
                <option value="Interested">{t('status.Interested')}</option>
                <option value="Not Interested">{t('status.Not Interested')}</option>
                <option value="Converted">{t('status.Converted')}</option>
              </select>
            </div>

            {/* Interested In */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('leads.interestedIn')}
              </label>
              <input
                type="text"
                value={formData.interestedIn}
                onChange={(e) => setFormData({ ...formData, interestedIn: e.target.value })}
                className={`w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626] ${isRTL ? 'text-right' : 'text-left'}`}
                placeholder="e.g., Apartment in Madinaty"
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium text-[#16100A] mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('common.notes')}
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className={`w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626] min-h-[100px] ${isRTL ? 'text-right' : 'text-left'}`}
                placeholder={t('common.notes')}
              />
            </div>
          </div>

          {/* Actions */}
          <div className={`flex items-center justify-end gap-3 mt-8 pt-6 border-t border-[#E5E5E5] ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-[#E5E5E5] rounded-lg text-[#555555] hover:bg-[#F7F7F7] transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#E0A626] text-white rounded-lg hover:bg-[#C99420] transition-colors"
            >
              {lead ? t('leads.saveChanges') : t('leads.addLead')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}