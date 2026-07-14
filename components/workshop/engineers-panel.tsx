"use client";

import React from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import type { Engineer } from "@/lib/types";

/**
 * @component EngineersPanel
 * @description لوحة إدارة المهندسين (متاحة للمدير فقط).
 * تعرض قائمة بالمهندسين المسجلين، وتتيح إضافة مهندس جديد أو حذف مهندس موجود.
 */
export function EngineersPanel({
  engineers,
  onAdd,
  onEdit,
  onDelete,
}: {
  engineers: Engineer[];
  onAdd: () => void;
  onEdit: (engineer: Engineer) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section className="w-full rounded-[2rem] border border-slate-200/40 bg-slate-100/50 p-2 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-550 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.04)]">
      <div className="w-full rounded-[calc(2rem-0.5rem)] bg-white p-5 border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">إدارة المهندسين</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={onAdd}
              className="group inline-flex h-11 items-center justify-center gap-3 rounded-full bg-brand-green pl-2 pr-5 text-sm font-bold text-white shadow-card transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-brand-greenDark active:scale-95 cursor-pointer"
            >
              إضافة مهندس
              <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                <Plus size={16} />
              </span>
            </button>
            <span className="hidden rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-500 sm:inline-block border border-slate-200">
              خاص بالمدير 👑
            </span>
          </div>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full min-w-[640px] border-collapse text-right">
            <thead>
              <tr className="bg-slate-50 text-sm text-slate-700 border-b border-slate-100">
                <th className="px-6 py-5 font-bold">اسم المهندس</th>
                <th className="px-6 py-5 font-bold">رقم الهاتف</th>
                <th className="px-6 py-5 font-bold">مكان السكن</th>
                <th className="px-6 py-5 font-bold">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {engineers.map((engineer) => (
                <tr key={engineer.id} className="border-b border-slate-100 transition hover:bg-slate-50/50">
                  <td className="px-6 py-5 text-base font-bold text-slate-800">{engineer.name}</td>
                  <td className="px-6 py-5 text-base font-semibold text-slate-600" dir="ltr">
                    {engineer.phone}
                  </td>
                  <td className="px-6 py-5 text-base text-slate-600 font-medium">{engineer.address}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(engineer)}
                        className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-500 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-slate-200 active:scale-95 cursor-pointer"
                        aria-label="تعديل المهندس"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => {
                          onDelete(engineer.id);
                        }}
                        className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-brand-red transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-red-100 active:scale-95 cursor-pointer"
                        aria-label="حذف المهندس"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
