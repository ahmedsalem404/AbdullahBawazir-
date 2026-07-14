import { Profile } from "@/types/workshop";

/**
 * تسجيل الدخول بإرسال اسم المستخدم وكلمة المرور واختيار الفرع
 */
export async function loginService(username: string, password: string, branch: string): Promise<Profile> {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, branch }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "تعذر تسجيل الدخول");
  }
  return data;
}

/**
 * تسجيل الخروج وإلغاء الجلسة الفعالة من الكوكيز
 */
export async function logoutService(): Promise<void> {
  const res = await fetch("/api/auth", { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "فشل تسجيل الخروج");
  }
}

/**
 * جلب بيانات الجلسة الحالية الفعالة للمستخدم
 */
export async function getMeService(): Promise<Profile> {
  const res = await fetch("/api/auth/me");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "فشلت عملية التحقق من الجلسة");
  }
  return data.user;
}
