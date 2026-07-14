import { Profile, UserFormValues } from "@/types/workshop";

/**
 * جلب قائمة كافة مستخدمي النظام من الخادم (متاح للسوبر أدمن فقط)
 */
export async function getUsersService(): Promise<Profile[]> {
  const res = await fetch("/api/users");
  const data = await res.json().catch(() => ([]));
  if (!res.ok) {
    throw new Error(data.error || "فشل جلب المستخدمين");
  }
  return data;
}

/**
 * إنشاء مستخدم جديد في النظام
 */
export async function createUserService(values: UserFormValues): Promise<Profile> {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "فشل إنشاء الحساب الجديد");
  }
  return data;
}

/**
 * تعديل بيانات مستخدم موجود (الاسم الكامل، الفرع، الصلاحيات، أو كلمة المرور)
 */
export async function updateUserService(id: string, values: Partial<UserFormValues> & { isActive?: boolean }): Promise<Profile> {
  const res = await fetch(`/api/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "فشل تعديل بيانات المستخدم");
  }
  return data;
}

/**
 * تفعيل أو تعطيل حساب مستخدم بضغطة زر
 */
export async function toggleUserStatusService(id: string, isActive: boolean): Promise<Profile> {
  const res = await fetch(`/api/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "فشل تعديل حالة الحساب");
  }
  return data;
}

/**
 * حذف حساب مستخدم نهائياً من قاعدة البيانات
 */
export async function deleteUserService(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/users/${id}`, {
    method: "DELETE",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "فشل حذف المستخدم");
  }
  return data;
}
