import { Debtor, DebtTransaction, DebtCurrency, DebtTxType } from "@/types/workshop";

/**
 * جلب قائمة المديونين
 */
export async function getDebtorsService(): Promise<Debtor[]> {
  const res = await fetch("/api/debts");
  const data = await res.json().catch(() => []);
  if (!res.ok) {
    throw new Error(data.error || "فشل جلب قائمة المديونين");
  }
  return data;
}

/**
 * حفظ مديون جديد أو تعديله
 */
export async function saveDebtorService(
  values: { name: string; phone?: string | null; address?: string | null },
  id?: string
): Promise<Debtor> {
  const method = id ? "PUT" : "POST";
  const url = id ? `/api/debts/${id}` : "/api/debts";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "فشل حفظ المديون");
  }
  return data;
}

/**
 * حذف مديون
 */
export async function deleteDebtorService(id: string): Promise<void> {
  const res = await fetch(`/api/debts/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "فشل حذف المديون");
  }
}

/**
 * جلب كشف حساب المديون بناءً على المعرف والعملة الفعالة
 */
export async function getDebtTransactionsService(
  debtorId: string,
  currency?: DebtCurrency
): Promise<DebtTransaction[]> {
  let url = `/api/debts/transactions?debtor_id=${debtorId}`;
  if (currency) {
    url += `&currency=${currency}`;
  }

  const res = await fetch(url);
  const data = await res.json().catch(() => []);
  if (!res.ok) {
    throw new Error(data.error || "فشل جلب كشف الحساب");
  }
  return data;
}

/**
 * تسجيل حركة مديونية جديدة أو تعديلها (له أو عليه)
 */
export async function saveDebtTransactionService(
  values: {
    debtor_id: string;
    type: DebtTxType;
    amount: number;
    currency: DebtCurrency;
    details?: string | null;
  },
  id?: string
): Promise<DebtTransaction> {
  const method = id ? "PUT" : "POST";
  const url = id ? `/api/debts/transactions/${id}` : "/api/debts/transactions";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "فشل تسجيل الحركة المالية");
  }
  return data;
}

/**
 * حذف حركة مديونية
 */
export async function deleteDebtTransactionService(id: string): Promise<void> {
  const res = await fetch(`/api/debts/transactions/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "فشل حذف الحركة المالية");
  }
}
