import React, { useState } from 'react';
import { X } from 'lucide-react';

interface Deal {
  id: string;
  title: string;
  client: string;
  property: string;
  propertyName: string; // ✅ الحقل الإلزامي اللي الـ TS طالبه
  price: number;
  salesAgent: string;
  status: 'New Deal' | 'Negotiation' | 'Reservation' | 'Closed Won' | 'Closed Lost' | 'New';
  createdAt: string;
  notes?: string;
}

interface DealModalProps {
  deal: Deal | null;
  onClose: () => void;
  onSave: (deal: any) => void;
}

const statuses = ['New Deal', 'Negotiation', 'Reservation', 'Closed Won', 'Closed Lost'];

const salesAgents = ['Abdallah Elgamal', 'Esmaeil Mohamed', 'Raghad', 'Noha', 'Mohamed Elbaze'];
const properties = [
  'Villa B1-034, Madinaty',
  'Apartment 45, Rehab',
  'Villa B3-023, Madinaty',
  'Apartment 78, Rehab',
  'Commercial COM-012, Thousand',
  'Apartment 156, Celia',
  'Villa B6-078, Madinaty',
  'Apartment 92, Sharm Bay',
];

export function DealModal({ deal, onClose, onSave }: DealModalProps) {
  // ✅ الحل السحري: تهيئة الـ State بالبيانات الصحيحة مباشرة (Lazy Initialization)
  // ده بيحل مشكلة الـ Cascading Renders وبيغنينا عن الـ useEffect تماماً
  const [formData, setFormData] = useState(() => ({
    title: deal?.title || '',
    client: deal?.client || '',
    property: deal?.property || '',
    propertyName: deal?.propertyName || deal?.property?.split(',')[0] || '', // ✅ حل مشكلة الحقل المفقود
    price: deal?.price?.toString() || '',
    salesAgent: deal?.salesAgent || 'Abdallah Elgamal',
    status: deal?.status || 'New Deal',
    notes: deal?.notes || '',
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ✅ تحويل السعر لرقم (Number) قبل الحفظ لحل أخطاء الـ Arithmetic Operation
    const finalData = {
      ...formData,
      price: Number(formData.price) || 0
    };
    onSave(finalData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E5E5E5] px-6 py-4 flex items-center justify-between">
          <h2 className="font-bold text-[#16100A]">
            {deal ? 'Edit Deal' : 'Create New Deal'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#555555]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#16100A] mb-2">
                Deal Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626]"
                placeholder="e.g., Villa B1-034 Sale"
                required
              />
            </div>

            {/* Client */}
            <div>
              <label className="block text-sm font-medium text-[#16100A] mb-2">
                Client Name *
              </label>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626]"
                placeholder="Enter client name"
                required
              />
            </div>

            {/* Property */}
            <div>
              <label className="block text-sm font-medium text-[#16100A] mb-2">
                Property *
              </label>
              <select
                value={formData.property}
                onChange={(e) => setFormData({ ...formData, property: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626]"
                required
              >
                <option value="">Select property</option>
                {properties.map(prop => (
                  <option key={prop} value={prop}>{prop}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-[#16100A] mb-2">
                Deal Value (EGP) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626]"
                placeholder="e.g., 8500000"
                required
              />
            </div>

            {/* Sales Agent */}
            <div>
              <label className="block text-sm font-medium text-[#16100A] mb-2">
                Sales Agent *
              </label>
              <select
                value={formData.salesAgent}
                onChange={(e) => setFormData({ ...formData, salesAgent: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626]"
                required
              >
                {salesAgents.map(agent => (
                  <option key={agent} value={agent}>{agent}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#16100A] mb-2">
                Deal Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626]"
                required
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#16100A] mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626] min-h-[100px]"
                placeholder="Add any additional notes about the deal..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-[#E5E5E5]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-[#E5E5E5] rounded-lg text-[#555555] hover:bg-[#F7F7F7] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#E0A626] text-white rounded-lg hover:bg-[#C99420] transition-colors"
            >
              {deal ? 'Save Changes' : 'Create Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}