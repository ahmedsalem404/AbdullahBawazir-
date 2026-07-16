import {
  Company,
  CompanyFormValues,
  CompanyCar,
  CompanyCarFormValues,
  CompanyInvoice,
  CompanyInvoiceFormValues,
} from "@/types/workshop";

/**
 * جلب كافة الشركات المتعاقدة
 */
export async function getCompaniesService(): Promise<Company[]> {
  const res = await fetch("/api/companies");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "فشل جلب بيانات الشركات");
  }
  return data;
}

/**
 * حفظ أو تعديل بيانات شركة
 */
export async function saveCompanyService(
  values: CompanyFormValues,
  id?: string
): Promise<Company> {
  const method = id ? "PUT" : "POST";
  const url = id ? `/api/companies/${id}` : "/api/companies";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "فشل حفظ بيانات الشركة");
  }
  return data;
}

/**
 * حذف شركة
 */
export async function deleteCompanyService(id: string): Promise<void> {
  const res = await fetch(`/api/companies/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "فشل حذف الشركة");
  }
}

/**
 * جلب سيارات شركة محددة
 */
export async function getCompanyCarsService(companyId: string): Promise<CompanyCar[]> {
  const res = await fetch(`/api/companies/cars?companyId=${companyId}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "فشل جلب سيارات الشركة");
  }
  return data;
}

/**
 * حفظ سيارة شركة جديدة أو تعديلها
 */
export async function saveCompanyCarService(
  values: CompanyCarFormValues,
  id?: string
): Promise<CompanyCar> {
  const method = id ? "PUT" : "POST";
  const url = id ? `/api/companies/cars?id=${id}` : "/api/companies/cars";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "فشل حفظ سيارة الشركة");
  }
  return data;
}

/**
 * حذف سيارة شركة
 */
export async function deleteCompanyCarService(id: string): Promise<void> {
  const res = await fetch(`/api/companies/cars?id=${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "فشل حذف سيارة الشركة");
  }
}

/**
 * جلب فواتير سيارة محددة
 */
export async function getCompanyInvoicesService(
  carId: string,
  month?: string,
  year?: string,
  accounted?: string,
  sent?: string
): Promise<CompanyInvoice[]> {
  const params = new URLSearchParams({ carId });
  if (month) params.append("month", month);
  if (year) params.append("year", year);
  if (accounted) params.append("accounted", accounted);
  if (sent) params.append("sent", sent);

  const res = await fetch(`/api/companies/invoices?${params.toString()}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "فشل جلب فواتير السيارة");
  }
  return data;
}

/**
 * حفظ فاتورة صيانة لسيارة شركة (إضافة أو تعديل)
 */
export async function saveCompanyInvoiceService(
  values: CompanyInvoiceFormValues,
  id?: string
): Promise<CompanyInvoice> {
  const method = id ? "PUT" : "POST";
  const url = id ? `/api/companies/invoices/${id}` : "/api/companies/invoices";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "فشل حفظ فاتورة الصيانة");
  }
  return data;
}

/**
 * حذف فاتورة صيانة
 */
export async function deleteCompanyInvoiceService(id: string): Promise<void> {
  const res = await fetch(`/api/companies/invoices/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "فشل حذف فاتورة الصيانة");
  }
}
