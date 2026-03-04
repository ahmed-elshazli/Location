import { create } from 'zustand';

interface ToastState {
  show: boolean;
  msg: string;
  type: 'success' | 'error';
  triggerToast: (msg: string, type: 'success' | 'error') => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  show: false,
  msg: '',
  type: 'success',
  triggerToast: (msg, type) => {
    set({ show: true, msg, type });
    // التنظيف التلقائي
    setTimeout(() => set({ show: false }), 5000); 
  },
  hideToast: () => set({ show: false }),
}));