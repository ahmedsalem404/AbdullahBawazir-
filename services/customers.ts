import { Customer, CustomerFormValues, FinancialBreakdown } from "@/types/workshop";

interface GetCustomersParams {
  page: number;
  pageSize: number;
  dateFilter: string;
  search?: string;
  isManager: boolean;
  onlyUnderWork?: boolean;
}

interface GetCustomersResponse {
  data: Customer[];
  count: number;
  financialBreakdown: FinancialBreakdown;
}

/**
 * جلب قائمة العملاء من الخادم بالاعتماد على الفلاتر والترقيم
 */
export async function getCustomersService({
  page,
  pageSize,
  dateFilter,
  search,
  isManager,
  onlyUnderWork,
}: GetCustomersParams): Promise<GetCustomersResponse> {
  const url = new URL("/api/customers", window.location.origin);
  url.searchParams.set("page", page.toString());
  url.searchParams.set("pageSize", pageSize.toString());
  url.searchParams.set("date", dateFilter);
  url.searchParams.set("isManager", isManager ? "true" : "false");

  if (onlyUnderWork) {
    url.searchParams.set("onlyUnderWork", "true");
  }

  if (search?.trim()) {
    url.searchParams.set("search", search.trim());
  }

  // حساب تواريخ البداية والنهاية ISO بالاعتماد على الفلتر اليومي
  const [year, month, day] = dateFilter.split("-").map(Number);
  const filterStart = new Date(year, month - 1, day, 0, 0, 0, 0).toISOString();
  const filterEnd = new Date(year, month - 1, day, 23, 59, 59, 999).toISOString();

  url.searchParams.set("start", filterStart);
  url.searchParams.set("end", filterEnd);

  const res = await fetch(url.toString());
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "فشل جلب بيانات العملاء");
  }
  return data;
}

/**
 * حفظ بيانات العميل (إضافة أو تعديل)
 */
export async function saveCustomerService(
  values: CustomerFormValues,
  createdBy: string | null | undefined,
  id?: string
): Promise<Customer> {
  const method = id ? "PUT" : "POST";
  const url = id ? `/api/customers/${id}` : "/api/customers";
  const payload = { ...values, created_by: createdBy };

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "فشل حفظ بيانات العميل");
  }
  return data;
}

/**
 * حذف سجل العميل من النظام
 */
export async function deleteCustomerService(id: string): Promise<void> {
  const res = await fetch(`/api/customers/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "فشل حذف العميل");
  }
}

interface GetMonthlyReportParams {
  year: number;
  month: number;
}

/**
 * جلب إجماليات الإيرادات الشهرية المجمعة للمدير
 */
export async function getMonthlyReportService({
  year,
  month,
}: GetMonthlyReportParams): Promise<{ financialBreakdown: FinancialBreakdown }> {
  const url = new URL("/api/customers", window.location.origin);
  url.searchParams.set("page", "1");
  url.searchParams.set("pageSize", "1");
  url.searchParams.set("isManager", "true");

  // تاريخ البداية والنهاية للشهر المحدد
  const filterStart = new Date(year, month - 1, 1, 0, 0, 0, 0).toISOString();
  const filterEnd = new Date(year, month, 0, 23, 59, 59, 999).toISOString();

  url.searchParams.set("start", filterStart);
  url.searchParams.set("end", filterEnd);

  const res = await fetch(url.toString());
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "فشل جلب التقرير الشهري");
  }
  return { financialBreakdown: data.financialBreakdown };
}

