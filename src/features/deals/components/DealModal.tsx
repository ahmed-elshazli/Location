import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useUsers } from '../../users/hooks/useUsers';
import { useUnits } from '../../properties/hooks/useUnits'; // ✅ استيراد هوك العقارات
import { useToastStore } from '../../../store/useToastStore';
import { useCreateDeal } from '../hooks/useCreateDeal';
import { useUpdateDeal } from '../hooks/useUpdateDeal';
import { useDeleteDeal } from '../hooks/useDeleteDeal';

interface Deal {
  _id?: string;
  id?: string;
  title: string;
  client: string;
  property: any; // غيرناها لـ any لدعم الـ Object أو الـ ID
  propertyName: string;
  price: number;
  salesAgent: any;
  status: 'New Deal' | 'Negotiation' | 'Reservation' | 'Closed Won' | 'Closed Lost' | 'New';
  createdAt: string;
  notes?: string;
}

interface DealModalProps {
  deal: Deal | null;
  onClose: () => void;
  onSave?: (deal: any) => void;
}

const statuses = ['NEW', 'NEGOTIATION', 'RESERVATION', 'CLOSED_WON', 'CLOSED_LOST'];
export function DealModal({ deal, onClose, onSave }: DealModalProps) {
  // 1. مناداة البيانات من السيرفر (Users & Units)
  const { data: usersData, isLoading: isUsersLoading } = useUsers();
  const { data: unitsData, isLoading: isUnitsLoading } = useUnits(); 
  const { triggerToast } = useToastStore();
  
  // 2. معالجة البيانات لتكون مصفوفات
  const usersList = Array.isArray(usersData) ? usersData : (usersData?.data || []);
  const unitsList = Array.isArray(unitsData) ? unitsData : (unitsData?.data || []);
  const createDeal = useCreateDeal();
  const updateDeal = useUpdateDeal();
  const deleteMutation = useDeleteDeal();

  const handleDelete = () => {
  if (window.confirm("هل أنت متأكد من حذف هذه الصفقة نهائياً؟")) {
    deleteMutation.mutate(deal._id || deal.id, {
      onSuccess: () => onClose(), // نقفل المودال بعد الحذف
    });
  }
};
  

  const [formData, setFormData] = useState(() => ({
    title: deal?.title || '',
    client: deal?.client || '',
    // ✅ سحب الـ ID بتاع البروبرتي سواء كان أوبجكت أو نص
    property: deal?.property?._id || deal?.property?.id || deal?.property || '',
    propertyName: deal?.propertyName || deal?.property?.split(',')[0] || '',
    price: deal?.price?.toString() || '',
    salesAgent: deal?.salesAgent?._id || deal?.salesAgent?.id || deal?.salesAgent || '', 
    status: deal?.status || 'New',
    notes: deal?.notes || '',
  }));

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const options = {
      onSuccess: () => {
        triggerToast(deal ? "تم تحديث الحالة ✅" : "تمت الإضافة 🚀", "success");
        onClose();
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message;
        triggerToast(Array.isArray(msg) ? msg[0] : msg || "خطأ في الإرسال", "error");
      }
    };

    if (deal) {
      // 🚀 الحل الجذري: نبعت الـ status بس لأن الـ endpoint مخصص للحالة
      updateDeal.mutate({ 
        id: deal._id || deal.id, 
        data: { status: formData.status } 
      }, options);
    } else {
      // في حالة الـ Create بنبعت الـ Payload كامل
      const createData = {
        title: formData.title,
        value: Number(formData.price) || 0,
        status: formData.status, 
        unit: formData.property,
        salesAgent: formData.salesAgent,
        client: formData.client,
        notes: formData.notes
      };
      createDeal.mutate(createData, options);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm  flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[#E5E5E5] px-6 py-4 flex items-center justify-between">
          <h2 className="font-bold text-[#16100A]">
            {deal ? 'Edit Deal' : 'Create New Deal'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#555555]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#16100A] mb-2">Deal Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626]"
                placeholder="e.g., Villa B1-034 Sale"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#16100A] mb-2">Client Name *</label>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626]"
                placeholder="Enter client name"
                required
              />
            </div>

            {/* Property - تم التحديث ليكون ديناميكي وبالـ ID ✅ */}
            <div>
              <label className="block text-sm font-medium text-[#16100A] mb-2">Property *</label>
              <select
                value={formData.property}
                onChange={(e) => setFormData({ ...formData, property: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626]"
                required
              >
                <option value="">{isUnitsLoading ? 'Loading units...' : 'Select property'}</option>
                {unitsList.map((unit: any) => (
                  // ✅ الـ value هو الـ ID والظاهر هو الكود أو العنوان
                  <option key={unit._id || unit.id} value={unit._id || unit.id}>
                    {unit.unitCode || unit.title || unit.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#16100A] mb-2">Deal Value (EGP) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626]"
                placeholder="e.g., 8500000"
                required
              />
            </div>

            {/* Sales Agent - ديناميكي ✅ */}
            <div>
              <label className="block text-sm font-medium text-[#16100A] mb-2">Sales Agent *</label>
              <select
                value={formData.salesAgent}
                onChange={(e) => setFormData({ ...formData, salesAgent: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626]"
                required
              >
                <option value="">{isUsersLoading ? 'Loading agents...' : 'Select Agent'}</option>
                {usersList.map((agent: any) => (
                  <option key={agent._id || agent.id} value={agent._id || agent.id}>
                    {agent.fullName || agent.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#16100A] mb-2">Deal Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626]"
                required
              >
                {statuses.map(s => (
    <option key={s} value={s}>
      {/* دي هتحول CLOSED_WON لـ Closed Won في القائمة بس ✅ */}
      {s.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
    </option>
  ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#16100A] mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E0A626] min-h-[100px]"
                placeholder="Add any additional notes about the deal..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-[#E5E5E5]">
            <button type="button" onClick={onClose} className="px-6 py-2 border border-[#E5E5E5] rounded-lg text-[#555555] hover:bg-[#F7F7F7]">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 bg-[#E0A626] text-white rounded-lg hover:bg-[#C99420]">
              {deal ? 'Save Changes' : 'Create Deal'}
            </button>

            {deal && (
  <button
    type="button"
    onClick={handleDelete}
    disabled={deleteMutation.isPending}
    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mr-auto"
  >
    {deleteMutation.isPending ? "جاري الحذف..." : "Delete Deal"}
  </button>
)}
          </div>
        </form>
      </div>
      
    </div>
  );
}