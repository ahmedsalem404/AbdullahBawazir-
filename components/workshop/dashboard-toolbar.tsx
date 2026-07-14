"use client";

import React from "react";
import { CalendarDays, Plus, Search } from "lucide-react";

/**
 * @component DashboardToolbar
 * @description شريط أدوات لوحة التحكم.
 * يحتوي على زر إضافة عميل جديد، ومربع البحث، ومفلتر التاريخ لتنظيم عرض البيانات.
 */
export function DashboardToolbar({
  dateFilter,
  search,
  onAdd,
  onDateChange,
  onSearchChange,
  onlyUnderWork,
  onOnlyUnderWorkToggle,
}: {
  dateFilter: string;
  search: string;
  onAdd: () => void;
  onDateChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onlyUnderWork: boolean;
  onOnlyUnderWorkToggle: () => void;
}) {
  return (
    <div className="w-full rounded-[2rem] border border-slate-200/40 bg-slate-100/50 p-2 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-550 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.04)]">
      <div className="w-full rounded-[calc(2rem-0.5rem)] bg-white p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
        <button
          onClick={onAdd}
          className="group inline-flex h-12 items-center justify-center gap-3 rounded-full bg-brand-green pl-2 pr-6 text-base font-bold text-white shadow-card transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-brand-greenDark active:scale-[0.98] cursor-pointer"
        >
          إضافة عميل جديد
          <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
            <Plus size={18} />
          </span>
        </button>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* زر التبديل السريع "قيد العمل" */}
          <button
            onClick={onOnlyUnderWorkToggle}
            type="button"
            className={`flex h-12 items-center gap-2 rounded-2xl border px-4 font-bold transition-all duration-300 active:scale-95 cursor-pointer ${
              onlyUnderWork
                ? "border-amber-200 bg-amber-50 text-amber-700 shadow-[0_4px_12px_rgba(245,158,11,0.15)]"
                : "border-brand-line bg-white text-slate-650 hover:bg-slate-50"
            }`}
          >
            <span className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${onlyUnderWork ? "bg-amber-500 animate-pulse" : "bg-slate-350"}`} />
            قيد العمل
          </button>

          <label className="relative block">
            <Search
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="بحث بالاسم أو الهاتف"
              className="h-12 w-full rounded-2xl border border-brand-line bg-white px-10 text-base outline-none transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus:border-brand-green focus:ring-4 focus:ring-brand-green/12 placeholder-slate-400 sm:w-72"
            />
          </label>
          <label className="relative block">
            <CalendarDays
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              value={dateFilter}
              onChange={(event) => onDateChange(event.target.value)}
              type="date"
              className="h-12 w-full rounded-2xl border border-brand-line bg-white px-10 text-base outline-none transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus:border-brand-green focus:ring-4 focus:ring-brand-green/12 sm:w-52"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
