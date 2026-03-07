import { useQuery } from '@tanstack/react-query';
import { fetchClientAnalytics } from '../api/clientsApi'; // استيراد الدالة من الملف السابق

export const useClientAnalytics = (id: string | null) => {
  return useQuery({
    queryKey: ['client-analytics', id],
    // قمنا باستدعاء الدالة هنا وتمرير الـ id لها
    queryFn: () => fetchClientAnalytics(id as string), 
    enabled: !!id, // لن يعمل الاستعلام إلا إذا كان الـ id موجوداً
    retry: false,  // عدم إعادة المحاولة في حالة الفشل
  });
};