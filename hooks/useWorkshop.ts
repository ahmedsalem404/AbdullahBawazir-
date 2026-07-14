import { useEffect, useState, useTransition, useCallback } from "react";
import { Customer, CustomerFormValues, Engineer, EngineerFormValues, Profile, FinancialBreakdown } from "@/types/workshop";
import { getCustomersService, saveCustomerService, deleteCustomerService, getMonthlyReportService } from "@/services/customers";
import { getEngineersService, saveEngineerService, deleteEngineerService } from "@/services/engineers";
import { todayInputValue, playSuccessSound, playErrorSound } from "@/components/workshop/constants";

interface UseWorkshopProps {
  profile: Profile | null;
  onLogout: () => void;
}

const PAGE_SIZE = 6;

/**
 * خطاف مخصص لإدارة حالة وبيانات لوحة تحكم ورشة الصيانة
 */
export function useWorkshop({ profile, onLogout }: UseWorkshopProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [financialBreakdown, setFinancialBreakdown] = useState<FinancialBreakdown>({
    Cash: { YER: 0, SAR: 0, USD: 0 },
    Transfer: { YER: 0, SAR: 0, USD: 0 },
    Manager_Hand: { YER: 0, SAR: 0, USD: 0 }
  });
  const [activeView, setActiveView] = useState<"dashboard" | "engineers" | "users" | "system" | "analytics" | "companies">("dashboard");
  const [dateFilter, setDateFilter] = useState(todayInputValue);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEngineerFormOpen, setIsEngineerFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [invoiceCustomer, setInvoiceCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [deleteTargetEngineer, setDeleteTargetEngineer] = useState<Engineer | null>(null);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isMonthlyReportOpen, setIsMonthlyReportOpen] = useState(false);
  const [monthlyReportData, setMonthlyReportData] = useState<FinancialBreakdown | null>(null);
  const [isMonthlyReportPending, setIsMonthlyReportPending] = useState(false);
  const [onlyUnderWork, setOnlyUnderWork] = useState(false);

  const handleOnlyUnderWorkToggle = () => {
    setPage(1);
    setOnlyUnderWork((prev) => !prev);
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    if (type === "success") {
      playSuccessSound();
    } else {
      playErrorSound();
    }
    setTimeout(() => {
      setToast((curr) => {
        if (curr && curr.message === message) return null;
        return curr;
      });
    }, 3000);
  };

  const isManager = profile?.role === "SUPER_ADMIN" || profile?.role === "ADMIN";
  const isSuperAdmin = profile?.role === "SUPER_ADMIN";

  /**
   * جلب كافة بيانات التطبيق (العملاء والمهندسين)
   */
  const loadData = async () => {
    if (!profile) return;

    try {
      // جلب المهندسين والعملاء بالتوازي لسرعة الأداء
      const [engineersData, customersData] = await Promise.all([
        getEngineersService(),
        getCustomersService({
          page,
          pageSize: PAGE_SIZE,
          dateFilter,
          search,
          isManager,
          onlyUnderWork,
        }),
      ]);

      setEngineers(engineersData);
      setCustomers(customersData.data);
      setTotalRows(customersData.count);
      if (isManager && customersData.financialBreakdown) {
        setFinancialBreakdown(customersData.financialBreakdown);
      }
    } catch (error) {
      console.error("Failed to load data", error);
    }
  };

  // إعادة تحميل البيانات عند تغيير الجلسة أو الفلاتر أو الصفحة الحالية أو فلتر قيد العمل
  useEffect(() => {
    if (!profile) {
      setCustomers([]);
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, dateFilter, search, page, onlyUnderWork]);

  /**
   * إضافة أو تحديث بيانات العميل
   */
  const saveCustomer = async (values: CustomerFormValues, id?: string): Promise<boolean> => {
    try {
      await saveCustomerService(values, profile?.id, id);
      await loadData();
      setIsFormOpen(false);
      showToast(id ? "تم تعديل العميل بنجاح ✅" : "تم إضافة العميل بنجاح ✅", "success");
      return true;
    } catch (error) {
      console.error(error);
      showToast("عذراً، حدث خطأ أثناء الحفظ. يرجى التحقق من اتصال الإنترنت ⚠️", "error");
      return false;
    }
  };

  /**
   * تأكيد حذف سجل العميل
   */
  const confirmDeleteCustomer = async (): Promise<boolean> => {
    if (!deleteTarget) return false;
    try {
      await deleteCustomerService(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
      showToast("تم حذف العميل بنجاح ✅", "success");
      return true;
    } catch (error) {
      console.error(error);
      showToast("عذراً، حدث خطأ أثناء الحذف. يرجى التحقق من اتصال الإنترنت ⚠️", "error");
      return false;
    }
  };

  /**
   * إضافة مهندس جديد
   */
  const saveEngineer = async (values: EngineerFormValues, id?: string): Promise<boolean> => {
    try {
      await saveEngineerService(values, id);
      await loadData();
      setIsEngineerFormOpen(false);
      showToast(id ? "تم تعديل المهندس بنجاح ✅" : "تم إضافة المهندس بنجاح ✅", "success");
      return true;
    } catch (error) {
      console.error(error);
      showToast("عذراً، حدث خطأ أثناء حفظ المهندس. يرجى التحقق من اتصال الإنترنت ⚠️", "error");
      return false;
    }
  };

  /**
   * حذف مهندس من النظام (حذف ناعم)
   */
  const deleteEngineer = async (id: string): Promise<boolean> => {
    try {
      await deleteEngineerService(id);
      await loadData();
      setDeleteTargetEngineer(null);
      showToast("تم حذف المهندس بنجاح ✅", "success");
      return true;
    } catch (error) {
      console.error(error);
      showToast("عذراً، حدث خطأ أثناء حذف المهندس. يرجى التحقق من اتصال الإنترنت ⚠️", "error");
      return false;
    }
  };

  /**
   * جلب عملاء اليوم بالكامل لغرض التقرير اليومي (بدون تقسيم صفحات)
   */
  const fetchDailyReportCustomers = useCallback(async (): Promise<Customer[]> => {
    try {
      const res = await getCustomersService({
        page: 1,
        pageSize: 2000,
        dateFilter,
        isManager: true,
      });
      return res.data;
    } catch (error) {
      console.error(error);
      showToast("عذراً، حدث خطأ أثناء تحميل بيانات التقرير اليومي ⚠️", "error");
      return [];
    }
  }, [dateFilter]);

  /**
   * جلب تقرير إيرادات الشهر المحدد
   */
  const loadMonthlyReport = useCallback(async (year: number, month: number) => {
    setIsMonthlyReportPending(true);
    try {
      const res = await getMonthlyReportService({ year, month });
      setMonthlyReportData(res.financialBreakdown);
    } catch (error) {
      console.error(error);
      showToast("عذراً، حدث خطأ أثناء تحميل التقرير الشهري. يرجى التحقق من اتصال الإنترنت ⚠️", "error");
    } finally {
      setIsMonthlyReportPending(false);
    }
  }, []);

  /**
   * التحكم بتغيير الصفحة بالاعتماد على الانتقال السلس
   */
  const handlePageChange = (nextPage: number) => {
    startTransition(() => {
      setPage(nextPage);
    });
  };

  /**
   * تغيير فلتر تاريخ اليوم وإعادة تعيين الصفحة الأولى
   */
  const handleDateChange = (value: string) => {
    setPage(1);
    setDateFilter(value);
  };

  /**
   * تغيير نص البحث الفوري وإعادة تعيين الصفحة الأولى
   */
  const handleSearchChange = (value: string) => {
    setPage(1);
    setSearch(value);
  };

  return {
    customers,
    engineers,
    totalRows,
    financialBreakdown,
    activeView,
    dateFilter,
    search,
    page,
    isFormOpen,
    isEngineerFormOpen,
    editingCustomer,
    invoiceCustomer,
    deleteTarget,
    deleteTargetEngineer,
    isPending,
    isManager,
    isSuperAdmin,

    // التحكم بالحالة والإجراءات
    setActiveView,
    setIsFormOpen,
    setIsEngineerFormOpen,
    setEditingCustomer,
    setInvoiceCustomer,
    setDeleteTarget,
    setDeleteTargetEngineer,
    saveCustomer,
    confirmDeleteCustomer,
    saveEngineer,
    deleteEngineer,
    handlePageChange,
    handleDateChange,
    handleSearchChange,
    loadData,
    toast,
    setToast,
    isMonthlyReportOpen,
    setIsMonthlyReportOpen,
    monthlyReportData,
    setMonthlyReportData,
    isMonthlyReportPending,
    fetchDailyReportCustomers,
    loadMonthlyReport,
    onlyUnderWork,
    handleOnlyUnderWorkToggle,
  };
}
