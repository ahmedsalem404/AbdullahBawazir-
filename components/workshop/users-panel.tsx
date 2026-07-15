"use client";

import React, { useState } from "react";
import { useUsers } from "@/hooks/useUsers";
import { Profile, UserFormValues } from "@/types/workshop";
import { Plus, Edit3, Trash2, Shield, User, Loader2, CheckCircle2, AlertTriangle, Key } from "lucide-react";
import { ConfirmModal } from "./modals";

interface UsersPanelProps {
  currentUserId: string;
}

export function UsersPanel({ currentUserId }: UsersPanelProps) {
  const {
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
  } = useUsers();

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // حالة نموذج إدخال البيانات
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"SUPER_ADMIN" | "ADMIN" | "WORKER">("WORKER");
  const [branch, setBranch] = useState("الحسوة");
  const [formError, setFormError] = useState("");

  const handleOpenAdd = () => {
    setUsername("");
    setFullName("");
    setPassword("");
    setRole("WORKER");
    setBranch("الحسوة");
    setEditingUser(null);
    setFormError("");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user: Profile) => {
    setUsername(user.username);
    setFullName(user.full_name);
    setPassword(""); // نترك الباسورد فارغاً إلا لو أراد تعديله
    setRole(user.role);
    setBranch(user.branch || "الحسوة");
    setEditingUser(user);
    setFormError("");
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!username.trim() || !fullName.trim()) {
      setFormError("اسم المستخدم والاسم الكامل مطلوبان");
      return;
    }

    if (!editingUser && !password.trim()) {
      setFormError("كلمة المرور مطلوبة للمستخدم الجديد");
      return;
    }

    const values: UserFormValues = {
      username: username.trim(),
      full_name: fullName.trim(),
      role,
      branch,
    };

    if (password.trim() !== "") {
      values.password = password;
    }

    await saveUser(values, editingUser?.id);
  };

  return (
    <div className="w-full space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed right-6 top-24 z-50 flex items-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold shadow-soft transition-all duration-300 ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-150"
              : "bg-red-50 text-red-800 border border-red-150"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-slate-150 bg-white/50 p-6 backdrop-blur-md">
        <div className="text-right">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
            <Shield className="text-slate-800" size={24} />
            إدارة الحسابات والصلاحيات 🔑
          </h2>
          <p className="text-sm font-semibold text-slate-500 mt-1">توليد حسابات الموظفين، تحديد صلاحيات الفروع وتفعيل/تعطيل الحسابات</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex h-12 items-center gap-2 rounded-2xl bg-brand-green px-6 text-sm font-bold text-white shadow-soft hover:bg-brand-greenDark transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Plus size={18} />
          إضافة مستخدم جديد 👤
        </button>
      </div>

      {/* Users List Grid */}
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
        {loading && users.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-brand-green" size={32} />
            <p className="font-bold text-slate-500">جاري تحميل قائمة المستخدمين...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center p-6">
            <p className="font-bold text-slate-400">لا يوجد مستخدمين مسجلين في النظام.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75">
                  <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-slate-500">المستخدم</th>
                  <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-slate-500">الاسم الكامل</th>
                  <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-slate-500">الصلاحية</th>
                  <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-slate-500">الفرع المسجل</th>
                  <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">حالة الحساب</th>
                  <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-slate-500 text-left">التحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => {
                  const isSelf = user.id === currentUserId;
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-600 font-bold text-sm">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <span>{user.username} {isSelf && <span className="text-xs text-blue-600 font-semibold">(حسابك الحالي)</span>}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-600">{user.full_name}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {user.role === "SUPER_ADMIN" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-bold text-red-700">
                            مدير عام (سوبر) 👑
                          </span>
                        ) : user.role === "ADMIN" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700">
                            مدير فرع 💼
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600">
                            موظف عادي 🛠️
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-600">
                        {user.role === "SUPER_ADMIN" ? "كافة الفروع 🌐" : user.branch}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => !isSelf && toggleUserStatus(user.id, user.isActive)}
                            disabled={isSelf}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none focus:ring-0 ${
                              user.isActive ? "bg-brand-green" : "bg-slate-200"
                            } ${isSelf ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-soft ring-0 transition duration-200 ease-in-out ${
                                user.isActive ? "-translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-left">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 border border-slate-150 hover:bg-slate-200 transition-all active:scale-90 cursor-pointer"
                            title="تعديل الحساب"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => !isSelf && setDeleteTargetId(user.id)}
                            disabled={isSelf}
                            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all border ${
                              isSelf
                                ? "bg-slate-100 text-slate-300 border-slate-150 cursor-not-allowed"
                                : "bg-red-50 text-red-600 border-red-150 hover:bg-red-100 hover:text-red-700 active:scale-90 cursor-pointer"
                            }`}
                            title={isSelf ? "لا يمكنك حذف حسابك الحالي" : "حذف المستخدم"}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Model Edit/Add User */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[500px] overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in-50 zoom-in-95 duration-250">
            <div className="rounded-[calc(2.5rem-0.5rem)] bg-white p-6 sm:p-8">
              <h3 className="mb-6 text-xl font-black text-slate-800 text-right">
                {editingUser ? "تعديل بيانات المستخدم 👤" : "إضافة مستخدم جديد 👤"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4 text-right">
                {formError && (
                  <div className="rounded-xl bg-red-50 border border-red-150 p-3 text-xs font-bold text-red-700">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">اسم المستخدم (Username)</label>
                  <input
                    type="text"
                    disabled={!!editingUser}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-green focus:ring-4 focus:ring-brand-green/12 disabled:bg-slate-50 disabled:text-slate-400"
                    placeholder="مثال: ahmed_s"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">الاسم الكامل</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-green focus:ring-4 focus:ring-brand-green/12"
                    placeholder="مثال: أحمد سالم"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>كلمة المرور</span>
                    {editingUser && <span className="text-[10px] text-slate-400 font-semibold">(اتركه فارغاً لعدم التغيير)</span>}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-green focus:ring-4 focus:ring-brand-green/12"
                    placeholder={editingUser ? "أدخل كلمة مرور جديدة للتغيير" : "أدخل كلمة المرور"}
                    required={!editingUser}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">صلاحية الحساب</label>
                  <select
                    disabled={editingUser?.id === currentUserId}
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none bg-white transition focus:border-brand-green disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="WORKER">موظف عادي (WORKER)</option>
                    {/* إخفاء صلاحيات ADMIN و SUPER_ADMIN مؤقتاً عند الإضافة ويظهر فقط في حالة تعديل حساب يمتلكهما */}
                    {editingUser && editingUser.role === "ADMIN" && (
                      <option value="ADMIN">مدير فرع (ADMIN)</option>
                    )}
                    {editingUser && editingUser.role === "SUPER_ADMIN" && (
                      <option value="SUPER_ADMIN">مدير عام النظام (SUPER_ADMIN)</option>
                    )}
                  </select>
                  {editingUser?.id === currentUserId && (
                    <p className="text-[10px] text-amber-600 font-semibold mt-1">تنبيه: لا يمكنك تغيير صلاحيتك الإدارية الخاصة بنفسك.</p>
                  )}
                </div>

                {role !== "SUPER_ADMIN" && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">الفرع المخصص</label>
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none bg-white transition focus:border-brand-green"
                    >
                      <option value="الحسوة">فرع الحسوة (الحسوة محطة ومجمع بتر بارك)</option>
                      <option value="الدرين">فرع الدرين (الدرين مقابل محطة باهدى)</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 h-11 rounded-xl bg-brand-green text-sm font-bold text-white shadow-sm hover:bg-brand-greenDark transition cursor-pointer"
                  >
                    {editingUser ? "حفظ التعديلات 💾" : "إنشاء الحساب 👤"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 h-11 rounded-xl bg-slate-100 text-sm font-bold text-slate-700 hover:bg-slate-250 transition cursor-pointer"
                  >
                    إلغاء ❌
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirm deletion */}
      {deleteTargetId && (
        <ConfirmModal
          title="تأكيد حذف الحساب"
          body="هل أنت متأكد من رغبتك في حذف هذا الحساب نهائياً؟ لا يمكن استرجاع الحساب المحذوف."
          onConfirm={async () => {
            await deleteUser(deleteTargetId);
            setDeleteTargetId(null);
          }}
          onCancel={() => setDeleteTargetId(null)}
        />
      )}
    </div>
  );
}
