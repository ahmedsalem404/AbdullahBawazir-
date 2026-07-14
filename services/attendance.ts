import { Attendance } from "@/types/workshop";

/**
 * جلب سجلات حضور وانصراف المهندسين بناءً على تاريخ محدد للفرع الحالي
 */
export async function getAttendanceByDateService(date: string): Promise<Attendance[]> {
  const url = new URL("/api/attendance", window.location.origin);
  url.searchParams.set("date", date);

  const res = await fetch(url.toString());
  const data = await res.json().catch(() => []);
  if (!res.ok) {
    throw new Error(data.error || "فشل جلب سجلات التحضير");
  }
  return data;
}

/**
 * تسجيل تحضير مهندس معين لتاريخ ووقت محددين
 */
export async function recordAttendanceService(
  engineerId: string,
  date: string,
  time: string
): Promise<Attendance> {
  const res = await fetch("/api/attendance", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      engineer_id: engineerId,
      date,
      time,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "فشل تسجيل تحضير المهندس");
  }
  return data;
}

/**
 * حذف سجل تحضير مهندس (إلغاء التحضير)
 */
export async function deleteAttendanceService(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/attendance/${id}`, {
    method: "DELETE",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "فشل إلغاء التحضير");
  }
  return data;
}
