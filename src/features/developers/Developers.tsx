import React, { useState } from "react";
import {
  Plus,
  Search,
  Building,
  MapPin,
  Phone,
  Mail,
  Edit2,
  Globe,
  Shield,
  UserCheck,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next"; // ✅ البديل الصحيح
import { useConfigStore } from "../../store/useConfigStore"; // ✅ لجلب الاتجاه
import { useAuthStore } from "../../store/useAuthStore"; // ✅ لجلب بيانات المستخدم
import { useDevelopers } from "./hooks/useDevelopers";
import z from "zod";
import { useCreateDeveloper } from "./hooks/useCreateDeveloper";
import { formatPhoneForBackend } from "../../utils/formatters";
import { useDevelopersSummary } from "./hooks/useDevelopersSummary";
import { useIndividualDevSummary } from "./hooks/useIndividualDevSummary";
import { useDeleteDeveloper } from "./hooks/useDeleteDeveloper";
import { useUpdateDeveloper } from "./hooks/useUpdateDeveloper";
import { useToastStore } from "../../store/useToastStore";

const developerSchema = z.object({
  name: z.string().min(3, "الاسم يجب أن يكون 3 حروف على الأقل"),
  email: z.string().email("بريد إلكتروني غير صحيح"),
  description: z.string().min(10, "الوصف يجب أن يكون 10 حروف على الأقل"),
  phone: z.string().nonempty("رقم الهاتف مطلوب"),
  location: z.string().nonempty("الموقع مطلوب"),
  area: z.array(z.string()).min(1, "يجب اختيار منطقة واحدة على الأقل"),
});

export default function Developers() {
  // ✅ جعلناه Default Export لحل مشكلة الـ Lazy Loading
  const [searchTerm, setSearchTerm] = useState("");

  const { t, i18n } = useTranslation(["developers", "common"]);
  const { dir } = useConfigStore();
  const { user } = useAuthStore();
  // تعريف حالة المطور المختار
const [selectedDevId, setSelectedDevId] = useState<string | null>(null);
  const { data: devStats, isLoading: isStatsLoading } = useIndividualDevSummary(selectedDevId);

  const isRTL = dir === "rtl";
  const language = i18n.language;
  const { data: backendDevs, isLoading, error } = useDevelopers(); 
  const deleteDevMutation = useDeleteDeveloper();
  const [isEditing, setIsEditing] = useState(false);
const updateDeveloper = useUpdateDeveloper();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    description: "",
    phone: "",
    location: "",
    area: [] as string[],
  });
  const [currentArea, setCurrentArea] = useState("");
  const { data: summary, isLoading: isSummaryLoading } = useDevelopersSummary();
  const { triggerToast } = useToastStore();

  const devList = Array.isArray(backendDevs)
    ? backendDevs
    : backendDevs?.data || backendDevs?.developers || [];

  const filteredDevelopers = devList.filter((dev: any) => {
    const matchesSearch =
      dev.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dev.nameAr?.includes(searchTerm) ||
      dev.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // 1. حالة الإشعار (Toast State)
  const [toast, setToast] = useState<{
    show: boolean;
    msg: string;
    type: "success" | "error";
  }>({
    show: false,
    msg: "",
    type: "success",
  });

  // 2. دالة إظهار الإشعار (triggerToast)
  

  const addArea = () => {
    if (currentArea.trim() && !formData.area.includes(currentArea.trim())) {
      setFormData({
        ...formData,
        area: [...formData.area, currentArea.trim()],
      });
      setCurrentArea("");
    }
  };

  const removeArea = (areaToRemove: string) => {
    setFormData({
      ...formData,
      area: formData.area.filter((a) => a !== areaToRemove),
    });
  };

  // 1. نداء الهوك في بداية المكون
  const createDeveloper = useCreateDeveloper();


  const closeModal = () => {
  // 1. قفل المودال
  setIsModalOpen(false);
  
  // 2. إعادة وضع التعديل لحالته الأصلية (إضافة)
  setIsEditing(false);
  
  // 3. مسح المعرف المختار
  setSelectedDevId(null);
  
  // 4. تصفير بيانات الفورم تماماً
  setFormData({
    name: '',
    email: '',
    description: '',
    phone: '',
    location: '',
    area: []
  });
};

  const handleSaveDeveloper = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const validation = developerSchema.safeParse(formData);
  if (!validation.success) {
    triggerToast(validation.error.issues[0].message, 'error');
    return;
  }

  // ✅ التعديل الجوهري هنا: تنسيق الرقم قبل الإرسال
  const payload = {
    ...validation.data,
    phone: formatPhoneForBackend(validation.data.phone) 
  };

  console.log("🚀 Sending to Backend:", payload); // لمراقبة الرقم في الكونسول

  if (isEditing && selectedDevId) {
  updateDeveloper.mutate({ id: selectedDevId, data: payload }, {
    onSuccess: () => {
      triggerToast('تم التحديث بنجاح ✅', 'success');
      closeModal();
    },
    onError: (error: any) => {
      // ✅ استخراج رسالة الخطأ من السيرفر
      const apiError = error.response?.data?.message || "فشل تحديث البيانات";
      // الباك إيند أحياناً بيبعت مصفوفة رسائل، هناخد أول واحدة
      const finalMsg = Array.isArray(apiError) ? apiError[0] : apiError;
      triggerToast(finalMsg, 'error');
    }
  });
} else {
  createDeveloper.mutate(payload, {
    onSuccess: () => {
      triggerToast('تم الإضافة بنجاح 🚀', 'success');
      closeModal();
    },
    onError: (error: any) => {
      // ✅ نفس المنطق لعملية الإضافة
      const apiError = error.response?.data?.message || "فشل إضافة المطور";
      const finalMsg = Array.isArray(apiError) ? apiError[0] : apiError;
      triggerToast(finalMsg, 'error');
    }
  });
}
};

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B5752A]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-10 font-bold">
        حدث خطأ أثناء تحميل بيانات المطورين!
      </div>
    );
  }

  const handleAddClick = () => {
  setIsEditing(false); // تأكيد وضع الإضافة
  setSelectedDevId(null); 
  setFormData({ // تصفير الفورم
    name: '', email: '', description: '',
    phone: '', location: '', area: []
  });
  setIsModalOpen(true);
};
  const handleEditClick = (developer: any) => {
  setSelectedDevId(developer._id || developer.id); // تأمين الـ ID للمونجو
  setFormData({
    name: developer.name,
    email: developer.email,
    description: developer.description,
    phone: developer.phone,
    location: developer.location,
    area: developer.area || developer.areas || []
  });
  setIsEditing(true);
  setIsModalOpen(true);
};
const handleDeleteDeveloper = (id: string, name: string) => {
  // 🛑 حماية: لو الـ ID مش موجود اخرج فوراً واطبع تحذير
  if (!id || id === 'undefined') {
    console.error("❌ Error: Developer ID is missing!");
    triggerToast("فشل الحذف: معرف المطور غير موجود", "error");
    return;
  }

  if (window.confirm(`هل أنت متأكد من حذف "${name}"؟`)) {
    deleteDevMutation.mutate(id, {
      onSuccess: () => triggerToast('تم الحذف بنجاح 🗑️', 'success'),
      onError: (error: any) => {
        // ✅ إظهار سبب فشل الحذف لليوزر
        const apiError = error.response?.data?.message || "لا يمكن حذف هذا المطور حالياً";
        const finalMsg = Array.isArray(apiError) ? apiError[0] : apiError;
        triggerToast(finalMsg, 'error');
      }
    });
  }
};
  return (
    <div className="p-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className={isRTL ? "text-right" : "text-left"}>
            <h1 className="text-2xl font-bold text-[#16100A] mb-2">
              {t("developers.management")}
            </h1>
            <p className="text-[#555555]">
              {t("developers.managementSubtitle")}
            </p>
          </div>
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all"
          >
            <Plus className="w-5 h-5" />
            {t("developers.addDeveloper")}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]`}
          />
          <input
            type="text"
            placeholder={t("developers.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"} py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* إجمالي المطورين */}
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
          <p
            className={`text-sm text-[#555555] mb-2 ${isRTL ? "text-right" : "text-left"}`}
          >
            {t("developers.totalDevelopers")}
          </p>
          <p className="text-2xl font-bold text-[#16100A]">
            {isSummaryLoading ? "..." : (summary?.totalDevelopers ?? 0)}
          </p>
        </div>

        {/* إجمالي المشاريع */}
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
          <p
            className={`text-sm text-[#555555] mb-2 ${isRTL ? "text-right" : "text-left"}`}
          >
            {t("developers.totalProjects")}
          </p>
          <p className="text-2xl font-bold text-[#16100A]">
            {isSummaryLoading ? "..." : (summary?.totalProjects ?? 0)}
          </p>
        </div>

        {/* إجمالي الوحدات */}
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
          <p
            className={`text-sm text-[#555555] mb-2 ${isRTL ? "text-right" : "text-left"}`}
          >
            {t("developers.totalUnits")}
          </p>
          <p className="text-2xl font-bold text-[#16100A]">
            {isSummaryLoading
              ? "..."
              : (summary?.totalUnits ?? 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Developers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDevelopers.map((developer: any) => (
          <div
            key={developer.id}
            className="bg-white rounded-lg border border-[#E5E5E5] p-6 hover:shadow-lg transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div
                className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  {/* ✅ استخدام الاسم العربي ولو مش موجود نستخدم الإنجليزي */}
                  <h3 className="font-bold text-[#16100A]">
                    {language === "ar"
                      ? developer.nameAr || developer.name
                      : developer.name}
                  </h3>
                  <p className="text-xs text-[#555555]">
                    {t("developers.developerId")}: {developer.id}
                  </p>
                </div>
              </div>
              <div className={`flex items-center gap-2 ${isRTL ? 'justify-start' : 'justify-end'}`}>
  {/* زرار التعديل (الموجود مسبقاً) */}
  <button onClick={() => handleEditClick(developer)} className="p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors">
    <Edit2 className="w-4 h-4 text-[#555555]" />
  </button>

  {/* ✅ زرار الحذف الجديد */}
  <button 
    onClick={() => handleDeleteDeveloper(developer._id || developer.id, developer.name)} 
    className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
    disabled={deleteDevMutation.isPending} // تعطيل الزرار أثناء عملية المسح
  >
    <Trash2 className={`w-4 h-4 ${deleteDevMutation.isPending ? 'text-gray-300' : 'text-red-600'}`} />
  </button>
</div>
            </div>

            {/* Description */}
            <p
              className={`text-sm text-[#555555] mb-4 ${isRTL ? "text-right" : "text-left"}`}
            >
              {/* ✅ تأمين الوصف */}
              {language === "ar"
                ? developer.descriptionAr || developer.description
                : developer.description}
            </p>

            {/* Contact Info */}
            <div className="space-y-2 mb-4 pb-4 border-b border-[#E5E5E5]">
              <div
                className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span dir="ltr">{developer.phone}</span>
              </div>
              <div
                className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span dir="ltr">{developer.email}</span>
              </div>
              {developer.website && (
                <div
                  className={`flex items-center gap-2 text-sm text-[#B5752A] ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <Globe className="w-4 h-4 flex-shrink-0" />
                  <span dir="ltr">{developer.website}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className={isRTL ? "text-right" : "text-left"}>
                <p className="text-xs text-[#555555] mb-1">
                  {t("developers.projects")}
                </p>
                <p className="font-bold text-[#16100A]">
                  {developer.projects ?? 0}
                </p>
              </div>
              <div className={isRTL ? "text-right" : "text-left"}>
                <p className="text-xs text-[#555555] mb-1">
                  {t("developers.totalUnits")}
                </p>
                {/* ✅ حماية toLocaleString من الـ undefined */}
                <p className="font-bold text-[#B5752A]">
                  {(developer.totalUnits ?? 0).toLocaleString()}
                </p>
              </div>
            </div>

            
            {/* Areas */}
            <div className={isRTL ? "text-right" : "text-left"}>
              <p
                className={`text-sm font-medium text-[#16100A] mb-2 flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <MapPin className="w-4 h-4" />
                {t("developers.activeAreas")}:
              </p>
              <div
                className={`flex flex-wrap gap-2 ${isRTL ? "justify-end" : "justify-start"}`}
              >
                {/* ✅ حماية الـ map والتأكد من اسم الحقل (area أو areas) */}
                {(
                  (language === "ar"
                    ? developer.areasAr || developer.area
                    : developer.areas || developer.area) || []
                ).map((area: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-[#F7F7F7] text-[#555555] text-sm rounded-lg"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300"
            dir={isRTL ? "rtl" : "ltr"}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between bg-[#F7F7F7]">
              <h2 className="text-xl font-bold text-[#16100A]">
                {t("developers.addDeveloper")}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <Plus className="w-6 h-6 rotate-45 text-[#555555]" />
              </button>
            </div>

            {/* Form Body */}
            <form className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">الاسم</label>
                <input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none"
                  placeholder="Mohamed Ahmed"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">البريد الإلكتروني</label>
                <input
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none"
                  placeholder="developer@example.com"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none h-24"
                  placeholder="وصف المطور وعدد سنوات الخبرة..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">الهاتف</label>
                <input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none"
                  placeholder="+20100..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">الموقع</label>
                <input
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#B5752A] outline-none"
                  placeholder="Cairo, Egypt"
                />
              </div>

              {/* Area Selection (Array handling) */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium">المناطق (Areas)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={currentArea}
                    onChange={(e) => setCurrentArea(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addArea())
                    }
                    className="flex-1 px-4 py-2 border rounded-lg outline-none"
                    placeholder="أدخل المنطقة واضغط Enter"
                  />
                  <button
                    type="button"
                    onClick={addArea}
                    className="bg-[#B5752A] text-white px-4 rounded-lg"
                  >
                    إضافة
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.area.map((a) => (
                    <span
                      key={a}
                      className="bg-[#FEF3E2] text-[#B5752A] px-3 py-1 rounded-full text-xs flex items-center gap-1 border border-[#B5752A]"
                    >
                      {a}{" "}
                      <Plus
                        className="w-3 h-3 rotate-45 cursor-pointer"
                        onClick={() => removeArea(a)}
                      />
                    </span>
                  ))}
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="px-6 py-4 bg-[#F7F7F7] border-t flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-6 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveDeveloper}
                className="px-8 py-2 gradient-primary text-white rounded-lg font-bold"
              >
                حفظ المطور
              </button>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
}
