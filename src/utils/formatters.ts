// --- دالة تنسيق الهاتف لتناسب الباك إيند ---
export const formatPhoneForBackend = (input: string) => {
  const cleaned = input.replace(/\D/g, ''); // حذف أي حروف غير الأرقام
  
  // إذا كان رقم مصري يبدأ بـ 01
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    return `+20${cleaned.substring(1)}`;
  }
  // إذا كان رقم سعودي يبدأ بـ 05
  if (cleaned.startsWith('05') && cleaned.length === 10) {
    return `+966${cleaned.substring(1)}`;
  }
  
  return input.startsWith('+') ? input : `+${input}`; 
};