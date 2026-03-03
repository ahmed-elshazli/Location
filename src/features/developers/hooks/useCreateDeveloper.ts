import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDeveloperApi, CreateDeveloperPayload } from '../api/developersApi';

export const useCreateDeveloper = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // نربط الـ Hook بدالة الـ API اللي عملناها فوق
    mutationFn: (newDev: CreateDeveloperPayload) => createDeveloperApi(newDev),
    
    onSuccess: () => {
      // ✅ تحديث قائمة المطورين أوتوماتيكياً في الكاش
      queryClient.invalidateQueries({ queryKey: ['developers'] });
    },
    
    // يمكنك إضافة منطق عام للخطأ هنا لو حبيت
    onError: (error: any) => {
      console.error("❌ Error creating developer:", error);
    }
  });
};