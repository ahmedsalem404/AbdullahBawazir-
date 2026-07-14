"use client";

import Image from "next/image";
import { Users, LogOut, FileText, Calendar, ClipboardCheck, Shield, Database, TrendingUp, Building } from "lucide-react";
import type { Profile } from "@/lib/types";
import { WORKSHOP_NAME } from "./constants";

import { InspectionReportsMenu } from "./InspectionReportsMenu";

interface AppHeaderProps {
  profile: Profile;
  activeView: "dashboard" | "engineers" | "users" | "system" | "analytics" | "companies";
  onViewChange: (view: "dashboard" | "engineers" | "users" | "system" | "analytics" | "companies") => void;
  onLogout: () => void;
  onAttendance: () => void;
  onOpenBuySellReport: () => void;
  onOpenRegularReport: () => void;
}

/**
 * @component AppHeader
 * @description الشريط العلوي للتطبيق (Header).
 * يعرض اسم المركز، ويحتوي على أزرار التنقل بين شاشة العملاء وشاشة المهندسين (للمدير فقط)، وزر تسجيل الخروج.
 */
export function AppHeader({
  profile,
  activeView,
  onViewChange,
  onLogout,
  onAttendance,
  onOpenBuySellReport,
  onOpenRegularReport,
}: AppHeaderProps) {
  const isManager = profile.role === "SUPER_ADMIN" || profile.role === "ADMIN";
  const isSuperAdmin = profile.role === "SUPER_ADMIN";

  return (
    <header className="no-print sticky top-4 z-30 mx-4 sm:mx-6 lg:mx-8 mt-4 rounded-[2rem] border border-slate-200/40 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-550 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.05)]">
      <div className="mx-auto flex h-20 w-full max-w-[1680px] items-center justify-between gap-4 px-6 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-14 w-14 shrink-0 flex items-center justify-center">
            <Image
              src="/bawazir-logo.png"
              alt={WORKSHOP_NAME}
              width={54}
              height={54}
              className="scale-[1.85] object-contain"
              priority
            />
          </div>
          <div className="min-w-0">
            <p className="max-w-[210px] text-base font-extrabold text-slate-800 leading-snug sm:max-w-none sm:text-2xl tracking-tight">
              {WORKSHOP_NAME}
            </p>
            <p className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
              <span>{profile.role === "SUPER_ADMIN" ? "المدير العام 👑" : profile.role === "ADMIN" ? "مدير فرع 💼" : "موظف المركز 🛠️"}</span>
              {profile.branch && (
                <>
                  <span className="text-slate-300">|</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-100">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <span>فرع {profile.branch}</span>
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onAttendance}
            className="hidden sm:flex h-11 items-center gap-2 rounded-2xl bg-slate-100 px-5 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95 cursor-pointer"
          >
            <ClipboardCheck size={18} />
            تحضير المهندسين
          </button>
          <InspectionReportsMenu
            onOpenBuySellReport={onOpenBuySellReport}
            onOpenRegularReport={onOpenRegularReport}
          />
          {isManager ? (
            <>
              <button
                onClick={() =>
                  onViewChange(
                    activeView === "engineers" ? "dashboard" : "engineers",
                  )
                }
                className={`hidden sm:flex h-11 items-center gap-2 rounded-2xl px-5 text-sm font-bold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95 cursor-pointer ${
                  activeView === "engineers"
                    ? "bg-blue-600 text-white shadow-card"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Users size={18} />
                إدارة المهندسين
              </button>
              <button
                onClick={() =>
                  onViewChange(
                    activeView === "system" ? "dashboard" : "system",
                  )
                }
                className={`hidden sm:flex h-11 items-center gap-2 rounded-2xl px-5 text-sm font-bold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95 cursor-pointer ${
                  activeView === "system"
                    ? "bg-brand-green text-white shadow-card"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Database size={18} />
                التقارير والنظام
              </button>
              {isSuperAdmin ? (
                <>
                  <button
                    onClick={() =>
                      onViewChange(
                        activeView === "companies" ? "dashboard" : "companies",
                      )
                    }
                    className={`hidden sm:flex h-11 items-center gap-2 rounded-2xl px-5 text-sm font-bold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95 cursor-pointer ${
                      activeView === "companies"
                        ? "bg-indigo-600 text-white shadow-card"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Building size={18} />
                    الشركات المتعاقدة
                  </button>
                  <button
                    onClick={() =>
                      onViewChange(
                        activeView === "analytics" ? "dashboard" : "analytics",
                      )
                    }
                    className={`hidden sm:flex h-11 items-center gap-2 rounded-2xl px-5 text-sm font-bold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95 cursor-pointer ${
                      activeView === "analytics"
                        ? "bg-indigo-600 text-white shadow-card"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <TrendingUp size={18} />
                    التحليلات
                  </button>
                </>
              ) : null}
            </>
          ) : null}
          <button
            onClick={onLogout}
            className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-700 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-red-50 hover:text-red-600 active:scale-95 cursor-pointer"
            aria-label="تسجيل الخروج"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
      <div 
        className="flex border-t border-slate-100/80 sm:hidden overflow-x-auto rounded-b-[2rem] bg-slate-50/40 py-2 px-3 gap-1.5"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <button
          onClick={() => onViewChange("dashboard")}
          className={`h-10 px-4 shrink-0 text-[11px] font-bold transition-all duration-300 rounded-xl ${activeView === "dashboard" ? "bg-blue-50 text-blue-600" : "bg-transparent text-slate-500"}`}
        >
          العملاء
        </button>
        <button
          onClick={onAttendance}
          className="h-10 px-4 shrink-0 text-[11px] font-bold transition-all duration-300 text-slate-500 hover:bg-slate-100/50 rounded-xl"
        >
          التحضير
        </button>
        {isManager ? (
          <>
            <button
              onClick={() => onViewChange("engineers")}
              className={`h-10 px-4 shrink-0 text-[11px] font-bold transition-all duration-300 rounded-xl ${activeView === "engineers" ? "bg-blue-50 text-blue-600" : "bg-transparent text-slate-500"}`}
            >
              المهندسين
            </button>
            <button
              onClick={() => onViewChange("system")}
              className={`h-10 px-4 shrink-0 text-[11px] font-bold transition-all duration-300 rounded-xl ${activeView === "system" ? "bg-blue-50 text-blue-600" : "bg-transparent text-slate-500"}`}
            >
              التقارير والنظام
            </button>
          </>
        ) : null}
         {isSuperAdmin ? (
          <>
            <button
              onClick={() => onViewChange("companies")}
              className={`h-10 px-4 shrink-0 text-[11px] font-bold transition-all duration-300 rounded-xl ${activeView === "companies" ? "bg-blue-50 text-blue-600" : "bg-transparent text-slate-500"}`}
            >
              الشركات
            </button>
            <button
              onClick={() => onViewChange("analytics")}
              className={`h-10 px-4 shrink-0 text-[11px] font-bold transition-all duration-300 rounded-xl ${activeView === "analytics" ? "bg-blue-50 text-blue-600" : "bg-transparent text-slate-500"}`}
            >
              التحليلات
            </button>
            <button
              onClick={onOpenBuySellReport}
              className="h-10 px-4 shrink-0 text-[11px] font-bold transition-all duration-300 text-slate-500 hover:bg-slate-100/50 rounded-xl"
            >
              📄 فحص بيع/شراء
            </button>
            <button
              onClick={onOpenRegularReport}
              className="h-10 px-4 shrink-0 text-[11px] font-bold transition-all duration-300 text-slate-500 hover:bg-slate-100/50 rounded-xl"
            >
              🛠️ فحص عادي
            </button>
          </>
        ) : null}
      </div>
    </header>
  );
}
