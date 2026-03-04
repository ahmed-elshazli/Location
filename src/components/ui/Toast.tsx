import React from 'react';
import { Plus, UserCheck, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToastStore } from '../../store/useToastStore';
import { useConfigStore } from '../../store/useConfigStore';

export const Toast = () => {
  const { show, msg, type, hideToast } = useToastStore();
  const { dir } = useConfigStore(); // للحفاظ على الاتجاه RTL/LTR
  const { t } = useTranslation('common');
  const isRTL = dir === 'rtl';

  if (!show) return null;

  return (
    <div className={`fixed bottom-10 ${isRTL ? "left-10" : "right-10"} z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300`}>
      <div className={`bg-white border-r-4 ${type === "success" ? "border-[#B5752A]" : "border-red-600"} shadow-2xl rounded-xl p-4 flex items-center gap-4 min-w-[320px]`}>
        <div className={`${type === "success" ? "bg-green-100" : "bg-red-100"} p-2 rounded-full`}>
          {type === "success" ? <UserCheck className="w-6 h-6 text-green-600" /> : <Shield className="w-6 h-6 text-red-600" />}
        </div>
        <div className={isRTL ? "text-right" : "text-left"}>
          <h4 className="text-[#16100A] font-bold text-sm">
            {type === "success" ? t('common.success') : t('common.error')}
          </h4>
          <p className="text-[#555555] text-xs">{msg}</p>
        </div>
        <button onClick={hideToast} className="ms-auto p-1 hover:bg-gray-100 rounded-full">
          <Plus className="w-4 h-4 rotate-45 text-gray-400" />
        </button>
      </div>
    </div>
  );
};