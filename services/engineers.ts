import { Engineer, EngineerFormValues } from "@/types/workshop";

/**
 * جلب قائمة المهندسين من الخادم للفرع الحالي
 */
export async function getEngineersService(): Promise<Engineer[]> {
  const res = await fetch("/api/engineers");
  const data = await res.json().catch(() => ([]));
  if (!res.ok) {
    throw new Error(
      typeof data === "object" && data !== null && "error" in data
        ? (data.error as string)
        : "فشل جلب بيانات المهندسين"
    );
  }
  return data;
}

/**
 * حفظ بيانات المهندس (إضافة مهندس جديد)
 */
export async function saveEngineerService(values: EngineerFormValues, id?: string): Promise<Engineer> {
  const method = id ? "PUT" : "POST";
  const url = id ? `/api/engineers?id=${id}` : "/api/engineers";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "فشل حفظ بيانات المهندس");
  }
  return data;
}

/**
 * حذف المهندس من النظام (حذف ناعم للفرع)
 */
export async function deleteEngineerService(id: string): Promise<void> {
  const res = await fetch(`/api/engineers?id=${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "فشل حذف المهندس");
  }
}
