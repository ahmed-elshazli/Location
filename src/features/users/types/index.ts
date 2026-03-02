/**
 * الأدوار المتاحة في السيستم بناءً على صلاحيات الباك إيند
 * ملحوظة: استخدمنا 'sales' كما طلبت في الـ Validation
 */
export type UserRole = 'admin' | 'sales' | 'user' | 'super_admin';

/**
 * الواجهة الخاصة بالبيانات المرسلة للباك إيند (Request Payload)
 * طبقاً للشروط: لا يوجد nameAr، والـ fullName يجب أن يكون 6 أحرف فأكثر
 */
export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
}

/**
 * الواجهة الخاصة بالرد القادم من السيرفر (API Response)
 */
export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
    phone: string;
    createdAt: string;
  };
  // التوكن قد يكون موجوداً إذا كان السيستم يقوم بعمل Auto-login بعد التسجيل
  token?: string; 
}

/**
 * واجهة خاصة بأخطاء الـ Validation القادمة من السيرفر (مثل خطأ 400)
 */
export interface RegisterError {
  status: number;
  message: string[]; // السيرفر يرسل الأخطاء في مصفوفة كما رأينا في الكونسول
}