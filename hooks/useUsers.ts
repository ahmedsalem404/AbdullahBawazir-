import { useState, useEffect, useCallback } from "react";
import { Profile, UserFormValues } from "@/types/workshop";
import {
  getUsersService,
  createUserService,
  updateUserService,
  toggleUserStatusService,
  deleteUserService,
} from "@/services/users";
import { playSuccessSound, playErrorSound } from "@/components/workshop/constants";

/**
 * خطاف مخصص لإدارة حالة وعمليات حسابات مستخدمي النظام (CRUD & Active Status)
 */
export function useUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    if (type === "success") {
      playSuccessSound();
    } else {
      playErrorSound();
    }
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // جلب كافة مستخدمي النظام
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsersService();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "فشل تحميل قائمة المستخدمين", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // إضافة أو تعديل مستخدم
  const saveUser = useCallback(async (values: UserFormValues, id?: string) => {
    try {
      if (id) {
        const updated = await updateUserService(id, values);
        setUsers(prev => prev.map(u => u.id === id ? updated : u));
        showToast("تم تحديث بيانات الحساب بنجاح ✅", "success");
      } else {
        const created = await createUserService(values);
        setUsers(prev => [created, ...prev]);
        showToast("تم إنشاء الحساب الجديد بنجاح ✅", "success");
      }
      setIsFormOpen(false);
      setEditingUser(null);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "تعذر حفظ بيانات الحساب ⚠️", "error");
    }
  }, [showToast]);

  // تفعيل أو إلغاء تفعيل حساب
  const toggleUserStatus = useCallback(async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const updated = await toggleUserStatusService(id, newStatus);
      setUsers(prev => prev.map(u => u.id === id ? updated : u));
      showToast(
        newStatus ? "تم تفعيل الحساب بنجاح ✅" : "تم تعطيل الحساب بنجاح 🔒",
        "success"
      );
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "فشل تغيير حالة الحساب ⚠️", "error");
    }
  }, [showToast]);

  // حذف الحساب
  const deleteUser = useCallback(async (id: string) => {
    try {
      await deleteUserService(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      showToast("تم حذف الحساب نهائياً 🗑️✅", "success");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "فشل حذف الحساب ⚠️", "error");
    }
  }, [showToast]);

  return {
    users,
    loading,
    isFormOpen,
    setIsFormOpen,
    editingUser,
    setEditingUser,
    toast,
    clearToast,
    saveUser,
    toggleUserStatus,
    deleteUser,
    refresh: loadUsers,
  };
}
