import { useState } from "react";
import {
  Plus, Search, Building, MapPin, Phone,
  Mail, Edit2, Globe, Trash2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useConfigStore } from "../../store/useConfigStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useDevelopers } from "./hooks/useDevelopers";
import { useCreateDeveloper } from "./hooks/useCreateDeveloper";
import { useDeleteDeveloper } from "./hooks/useDeleteDeveloper";
import { useUpdateDeveloper } from "./hooks/useUpdateDeveloper";
import { useDevelopersSummary } from "./hooks/useDevelopersSummary";
import { useIndividualDevSummary } from "./hooks/useIndividualDevSummary";
import { useToastStore } from "../../store/useToastStore";
import { DeveloperModal } from "./components/DeveloperModal";

const LIMIT = 6;

// ─── كارد منفصل عشان يستخدم useDeveloperSummary بشكل صحيح ───
function DeveloperCard({
  developer,
  isRTL,
  language,
  onEdit,
  onDelete,
  isDeleting,
}: {
  developer: any;
  isRTL: boolean;
  language: string;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const devId = developer._id || developer.id;
  const { data: devSummary, isLoading: isSummaryLoading } = useIndividualDevSummary(devId);

  const projectsCount = devSummary?.projectsCount   ?? developer.projectsCount ?? 0;
  const totalUnits    = devSummary?.totalUnitsSold  ?? developer.totalUnits   ?? 0;
  const revenue       = devSummary?.revenue         ?? 0;

  const getDisplayUrl = (url: string) => url.replace(/^https?:\/\//, "");
  const getFullUrl    = (url: string) => url.startsWith("http") ? url : `https://${url}`;

  return (
    <div className="bg-white rounded-lg border border-[#E5E5E5] p-6 hover:shadow-lg transition-shadow">

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Building className="w-6 h-6 text-white" />
          </div>
          <div className={isRTL ? "text-right" : "text-left"}>
            <h3 className="font-bold text-[#16100A] text-base">{developer.name}</h3>
            <p className="text-xs text-[#555555]">
              {language === "ar" ? "معرف المطور" : "Developer ID"}:{" "}
              {devId?.slice(-6)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={e => { e.stopPropagation(); onEdit(); }}
            className="p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4 text-[#AAAAAA]" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            disabled={isDeleting}
          >
            <Trash2 className={`w-4 h-4 ${isDeleting ? "text-gray-300" : "text-red-400"}`} />
          </button>
        </div>
      </div>

      {developer.description && (
        <p className={`text-sm text-[#555555] mb-4 leading-relaxed ${isRTL ? "text-right" : "text-left"}`}>
          {developer.description}
        </p>
      )}

      {/* Contact info */}
      <div className="space-y-2 mb-4 pb-4 border-b border-[#E5E5E5]">
        {developer.phone && (
          <div className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? "flex-row-reverse" : ""}`}>
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span dir="ltr">{developer.phone}</span>
          </div>
        )}
        {developer.email && (
          <div className={`flex items-center gap-2 text-sm text-[#555555] ${isRTL ? "flex-row-reverse" : ""}`}>
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span dir="ltr">{developer.email}</span>
          </div>
        )}
        {developer.website && (
          <div className={`flex items-center gap-2 text-sm ${isRTL ? "flex-row-reverse" : ""}`}>
            <Globe className="w-4 h-4 flex-shrink-0 text-[#B5752A]" />
            <a
              href={getFullUrl(developer.website)}
              target="_blank"
              rel="noreferrer"
              dir="ltr"
              className="text-[#B5752A] hover:underline"
            >
              {getDisplayUrl(developer.website)}
            </a>
          </div>
        )}
      </div>

      {/* Stats من /summary */}
      {/* <div className="grid grid-cols-3 gap-3 mb-4">
        <div className={isRTL ? "text-right" : "text-left"}>
          <p className="text-xs text-[#555555] mb-1">
            {language === "ar" ? "المشاريع" : "Projects"}
          </p>
          <p className="font-bold text-[#16100A] text-base">
            {isSummaryLoading
              ? <span className="inline-block w-6 h-4 bg-gray-200 animate-pulse rounded" />
              : projectsCount}
          </p>
        </div>
        <div className={isRTL ? "text-right" : "text-left"}>
          <p className="text-xs text-[#555555] mb-1">
            {language === "ar" ? "الوحدات المباعة" : "Units Sold"}
          </p>
          <p className="font-bold text-[#B5752A] text-base">
            {isSummaryLoading
              ? <span className="inline-block w-10 h-4 bg-gray-200 animate-pulse rounded" />
              : Number(totalUnits).toLocaleString()}
          </p>
        </div>
        <div className={isRTL ? "text-right" : "text-left"}>
          <p className="text-xs text-[#555555] mb-1">
            {language === "ar" ? "الإيرادات" : "Revenue"}
          </p>
          <p className="font-bold text-[#16100A] text-sm">
            {isSummaryLoading
              ? <span className="inline-block w-12 h-4 bg-gray-200 animate-pulse rounded" />
              : `${Number(revenue).toLocaleString()} EGP`}
          </p>
        </div>
      </div> */}

      {/* Areas */}
      {(developer.area || developer.areas || []).length > 0 && (
        <div className={isRTL ? "text-right" : "text-left"}>
          <p className={`text-sm font-semibold text-[#16100A] mb-2 flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
            <MapPin className="w-4 h-4 text-[#555555]" />
            {language === "ar" ? "المناطق النشطة" : "Active Areas"}:
          </p>
          <div className={`flex flex-wrap gap-2 ${isRTL ? "justify-end" : "justify-start"}`}>
            {(developer.area || developer.areas || []).map((area: string, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1 bg-[#F7F7F7] text-[#555555] text-sm rounded-lg border border-[#E5E5E5]"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───
export default function Developers() {
  const { t, i18n }      = useTranslation(["developers", "common"]);
  const { dir }          = useConfigStore();
  const { user }         = useAuthStore();
  const { triggerToast } = useToastStore();

  const isRTL    = dir === "rtl";
  const language = i18n.language;

  const [searchTerm,   setSearchTerm]   = useState("");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editingDev,   setEditingDev]   = useState<any>(null);
  const [deleteConfig, setDeleteConfig] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false, id: "", name: "",
  });

  const { data: backendDevs, isLoading, error } = useDevelopers();
  const { data: summary, isLoading: isSummaryLoading } = useDevelopersSummary();

  const createDeveloper   = useCreateDeveloper();
  const updateDeveloper   = useUpdateDeveloper();
  const deleteDevMutation = useDeleteDeveloper();

  const devList = Array.isArray(backendDevs?.data)
    ? backendDevs.data
    : Array.isArray(backendDevs)
    ? backendDevs
    : backendDevs?.developers || [];

  const filteredDevelopers = devList.filter((dev: any) =>
    dev.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dev.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages    = Math.max(1, Math.ceil(filteredDevelopers.length / LIMIT));
  const paginatedDevs = filteredDevelopers.slice((currentPage - 1) * LIMIT, currentPage * LIMIT);

  const handleSave = (data: any) => {
    const options = {
      onSuccess: () => {
        triggerToast(editingDev ? "تم التحديث بنجاح ✅" : "تمت الإضافة بنجاح 🚀", "success");
        setModalOpen(false);
        setEditingDev(null);
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message;
        triggerToast(Array.isArray(msg) ? msg[0] : msg || "حدث خطأ", "error");
      },
    };
    if (editingDev) {
      updateDeveloper.mutate({ id: editingDev._id || editingDev.id, data }, options);
    } else {
      createDeveloper.mutate(data, options);
    }
  };

  const confirmDelete = () => {
    deleteDevMutation.mutate(deleteConfig.id, {
      onSuccess: () => {
        triggerToast("تم الحذف بنجاح 🗑️", "success");
        setDeleteConfig({ isOpen: false, id: "", name: "" });
        if (paginatedDevs.length === 1 && currentPage > 1) setCurrentPage(p => p - 1);
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message;
        triggerToast(Array.isArray(msg) ? msg[0] : msg || "فشل الحذف", "error");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B5752A]" />
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

  return (
    <div className="p-6" dir={isRTL ? "rtl" : "ltr"}>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className={isRTL ? "text-right" : "text-left"}>
            <h1 className="text-2xl font-bold text-[#16100A] mb-2">{t("developers.management")}</h1>
            <p className="text-[#555555]">{t("developers.managementSubtitle")}</p>
          </div>
          <button
            onClick={() => { setEditingDev(null); setModalOpen(true); }}
            className="flex items-center gap-2 gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all"
          >
            <Plus className="w-5 h-5" />
            {t("developers.addDeveloper")}
          </button>
        </div>

        <div className="relative">
          <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555]`} />
          <input
            type="text"
            placeholder={t("developers.searchPlaceholder")}
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className={`w-full ${isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"} py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B5752A]`}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
          <p className={`text-sm text-[#555555] mb-2 ${isRTL ? "text-right" : "text-left"}`}>{t("developers.totalDevelopers")}</p>
          <p className="text-2xl font-bold text-[#16100A]">{isSummaryLoading ? "..." : (summary?.totalDevelopers ?? backendDevs?.results ?? 0)}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
          <p className={`text-sm text-[#555555] mb-2 ${isRTL ? "text-right" : "text-left"}`}>{t("developers.totalProjects")}</p>
          <p className="text-2xl font-bold text-[#16100A]">{isSummaryLoading ? "..." : (summary?.totalProjects ?? 0)}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6">
          <p className={`text-sm text-[#555555] mb-2 ${isRTL ? "text-right" : "text-left"}`}>{t("developers.totalUnits")}</p>
          <p className="text-2xl font-bold text-[#16100A]">{isSummaryLoading ? "..." : (summary?.totalUnits ?? 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Developers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {paginatedDevs.map((developer: any) => (
          <DeveloperCard
            key={developer._id || developer.id}
            developer={developer}
            isRTL={isRTL}
            language={language}
            onEdit={() => { setEditingDev(developer); setModalOpen(true); }}
            onDelete={() => setDeleteConfig({ isOpen: true, id: developer._id || developer.id, name: developer.name })}
            isDeleting={deleteDevMutation.isPending}
          />
        ))}

        {paginatedDevs.length === 0 && (
          <div className="col-span-2 text-center py-16 text-[#555555]">
            {language === "ar" ? "لا يوجد مطورين" : "No developers found"}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={`flex items-center justify-center gap-2 mt-8 ${isRTL ? "flex-row-reverse" : ""}`}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1 || isLoading}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E5E5] hover:bg-[#F7F7F7] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
            const isFirst = page === 1;
            const isLast  = page === totalPages;
            const isNear  = Math.abs(page - currentPage) <= 1;
            if (!isFirst && !isLast && !isNear) {
              if (page === 2 || page === totalPages - 1)
                return <span key={page} className="text-[#555555] text-sm px-1">...</span>;
              return null;
            }
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                disabled={isLoading}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                  page === currentPage
                    ? "gradient-primary text-white shadow-sm"
                    : "border border-[#E5E5E5] text-[#555555] hover:bg-[#F7F7F7]"
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || isLoading}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E5E5] hover:bg-[#F7F7F7] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          <span className="text-xs text-[#555555] mr-2 ml-2">
            {language === "ar"
              ? `صفحة ${currentPage} من ${totalPages}`
              : `Page ${currentPage} of ${totalPages}`}
          </span>
        </div>
      )}

      {/* Delete Modal */}
      {deleteConfig.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-[#16100A] mb-2">
                {language === "ar" ? "تأكيد الحذف" : "Confirm Delete"}
              </h3>
              <p className="text-[#555555] mb-6">
                {language === "ar"
                  ? `هل أنت متأكد من حذف "${deleteConfig.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`
                  : `Are you sure you want to delete "${deleteConfig.name}"? This cannot be undone.`}
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDeleteConfig({ isOpen: false, id: "", name: "" })}
                  className="flex-1 px-4 py-2 border border-[#E5E5E5] rounded-lg text-[#555555] hover:bg-[#F7F7F7] font-medium transition-colors"
                >
                  {t("common:common.cancel")}
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteDevMutation.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold transition-colors disabled:opacity-50"
                >
                  {deleteDevMutation.isPending ? "..." : t("common:common.delete")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Developer Modal */}
      {modalOpen && (
        <DeveloperModal
          developer={editingDev}
          onClose={() => { setModalOpen(false); setEditingDev(null); }}
          onSave={handleSave}
          isLoading={createDeveloper.isPending || updateDeveloper.isPending}
        />
      )}
    </div>
  );
}