import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useUsers } from '../../users/hooks/useUsers';
import { useAllUnits } from '../../properties/hooks/useAllUnits';
import { useClients } from '../../clients/hooks/useClients'; // ✅ clients من الباك
import { useToastStore } from '../../../store/useToastStore';
import { useCreateDeal } from '../hooks/useCreateDeal';
import { useUpdateDeal } from '../hooks/useUpdateDeal';
import { useDeleteDeal } from '../hooks/useDeleteDeal';

interface Deal {
  _id?: string;
  id?: string;
  title: string;
  client: any;
  unit?: any;
  value?: number;
  salesAgent: any;
  status: string;
  createdAt?: string;
  notes?: string;
}

interface DealModalProps {
  deal: Deal | null;
  onClose: () => void;
  onSave?: (deal: any) => void;
}

const statuses = ['NEW', 'NEGOTIATION', 'RESERVATION', 'CLOSED_WON', 'CLOSED_LOST'];

export function DealModal({ deal, onClose, onSave }: DealModalProps) {
  const { data: usersData,   isLoading: isUsersLoading   } = useUsers();
  const { data: unitsData,   isLoading: isUnitsLoading   } = useAllUnits();
  const { data: clientsData, isLoading: isClientsLoading } = useClients(); // ✅

  const { triggerToast } = useToastStore();

  const usersList   = Array.isArray(usersData)       ? usersData       : (usersData?.data   || []);
  const unitsList   = Array.isArray(unitsData?.data)  ? unitsData.data  : (Array.isArray(unitsData)   ? unitsData   : []);
  // ✅ نفس pattern الـ hooks التانية
  const clientsList = Array.isArray(clientsData?.data) ? clientsData.data : (Array.isArray(clientsData) ? clientsData : []);

  const createDeal     = useCreateDeal();
  const updateDeal     = useUpdateDeal();
  const deleteMutation = useDeleteDeal();

  // ✅ client دلوقتي بيخزن الـ _id مش الـ نص
  const getClientId = (client: any) => {
    if (typeof client === 'object' && client !== null) return client._id || client.id || '';
    return client || '';
  };

  const [formData, setFormData] = useState({
    title:      deal?.title || '',
    client:     getClientId(deal?.client),          // ✅ MongoDB ObjectId
    unit:       deal?.unit?._id || deal?.unit?.id || deal?.unit || '',
    price:      deal?.value?.toString() || '',
    salesAgent: deal?.salesAgent?._id || deal?.salesAgent?.id || deal?.salesAgent || '',
    status:     deal?.status || 'NEW',
    notes:      deal?.notes || '',
  });

  // ─── Confirm Delete State ──────────────────────────────────────────────────
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    deleteMutation.mutate(deal?._id || deal?.id, {
      onSuccess: () => onClose(),
      onError: (err: any) => {
        const msg = err.response?.data?.message;
        triggerToast(Array.isArray(msg) ? msg[0] : msg || "فشل الحذف", "error");
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title:      formData.title,
      client:     formData.client,       // ✅ MongoDB ObjectId
      unit:       formData.unit,
      value:      Number(formData.price),
      salesAgent: formData.salesAgent,
      status:     formData.status,
      notes:      formData.notes,
    };

    const options = {
      onSuccess: () => {
        triggerToast(deal ? "تم تحديث الصفقة ✅" : "تمت الإضافة 🚀", "success");
        onClose();
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message;
        triggerToast(Array.isArray(msg) ? msg[0] : msg || "خطأ في الإرسال", "error");
      }
    };

    if (deal) {
      updateDeal.mutate({ id: deal._id || deal.id, data: payload }, options);
    } else {
      createDeal.mutate(payload, options);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
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

            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#16100A] mb-2">Deal Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]"
                placeholder="e.g., Villa B1-034 Sale"
                required
              />
            </div>

            {/* ✅ Client - select من الباك بدل text input */}
            <div>
              <label className="block text-sm font-medium text-[#16100A] mb-2">Client *</label>
              <select
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] bg-white"
                required
              >
                <option value="">
                  {isClientsLoading ? 'Loading clients...' : 'Select Client'}
                </option>
                {clientsList.map((client: any) => (
                  <option key={client._id || client.id} value={client._id || client.id}>
                    {client.fullName || client.name || client.email || client._id}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit */}
            <div>
              <label className="block text-sm font-medium text-[#16100A] mb-2">Unit *</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] bg-white"
                required
              >
                <option value="">{isUnitsLoading ? 'Loading units...' : 'Select unit'}</option>
                {unitsList.map((unit: any) => (
                  <option key={unit._id || unit.id} value={unit._id || unit.id}>
                    {unit.unitCode} {unit.type ? `- ${unit.type}` : ''} {unit.price ? `(${unit.price.toLocaleString()} EGP)` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Value */}
            <div>
              <label className="block text-sm font-medium text-[#16100A] mb-2">Deal Value (EGP) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]"
                placeholder="e.g., 8500000"
                required
              />
            </div>

            {/* Sales Agent */}
            <div>
              <label className="block text-sm font-medium text-[#16100A] mb-2">Sales Agent *</label>
              <select
                value={formData.salesAgent}
                onChange={(e) => setFormData({ ...formData, salesAgent: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] bg-white"
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

            {/* Status */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#16100A] mb-2">Deal Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] bg-white"
                required
              >
                {statuses.map(s => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#16100A] mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A] min-h-[100px]"
                placeholder="Add any additional notes..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-[#E5E5E5]">
            {deal && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mr-auto"
              >
                Delete Deal
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-[#E5E5E5] rounded-lg text-[#555555] hover:bg-[#F7F7F7]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createDeal.isPending || updateDeal.isPending}
              className="px-6 py-2 gradient-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {createDeal.isPending || updateDeal.isPending
                ? '...'
                : deal ? 'Save Changes' : 'Create Deal'}
            </button>
          </div>
        </form>
      </div>

      {/* ─── Confirm Delete Modal ─────────────────────────────────────────────── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <X className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-[#16100A] mb-2">Delete Deal?</h3>
              <p className="text-[#555555] text-sm mb-6">
                Are you sure you want to delete this deal? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-[#E5E5E5] rounded-lg text-[#555555] hover:bg-[#F7F7F7] font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold transition-colors disabled:opacity-50"
                >
                  {deleteMutation.isPending ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}