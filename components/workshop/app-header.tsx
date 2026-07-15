"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Users, LogOut, FileText, Calendar, ClipboardCheck, Shield, Database, TrendingUp, Building, Menu, X, ChevronDown, Wrench } from "lucide-react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="no-print sticky top-4 z-30 mx-4 sm:mx-6 lg:mx-8 mt-4 rounded-[2rem] border border-slate-200/40 bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-550 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.05)]">
      <div className="mx-auto flex h-20 w-full max-w-[1680px] items-center justify-between gap-4 px-6 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-10 w-10 sm:h-14 sm:w-14 shrink-0 flex items-center justify-center">
            <Image
              src="/bawazir-logo.png"
              alt={WORKSHOP_NAME}
              width={40}
              height={40}
              className="scale-[2] sm:scale-[1.85] object-contain"
              priority
            />
          </div>
          <div className="min-w-0">
            <p className="max-w-[210px] text-[13px] xs:text-[15px] sm:text-2xl font-extrabold text-slate-800 leading-snug sm:max-w-none tracking-tight">
              {WORKSHOP_NAME}
            </p>
            <p className="text-[10px] xs:text-xs sm:text-sm font-semibold text-slate-500 flex items-center gap-1.5">
              <span>{profile.role === "SUPER_ADMIN" ? "المدير العام 👑" : profile.role === "ADMIN" ? "مدير فرع 💼" : "موظف المركز 🛠️"}</span>
              {profile.branch && (
                <>
                  <span className="text-slate-300">|</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] xs:text-xs font-bold text-emerald-700 border border-emerald-100">
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
            className="hidden lg:flex h-11 items-center gap-2 rounded-2xl bg-slate-100 px-5 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95 cursor-pointer"
          >
            <ClipboardCheck size={18} />
            تحضير المهندسين
          </button>
          <div className="hidden lg:block">
            <InspectionReportsMenu
              onOpenBuySellReport={onOpenBuySellReport}
              onOpenRegularReport={onOpenRegularReport}
            />
          </div>
          {isManager ? (
            <>
              <button
                onClick={() =>
                  onViewChange(
                    activeView === "engineers" ? "dashboard" : "engineers",
                  )
                }
                className={`hidden lg:flex h-11 items-center gap-2 rounded-2xl px-5 text-sm font-bold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95 cursor-pointer ${
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
                className={`hidden lg:flex h-11 items-center gap-2 rounded-2xl px-5 text-sm font-bold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95 cursor-pointer ${
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
                    className={`hidden lg:flex h-11 items-center gap-2 rounded-2xl px-5 text-sm font-bold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95 cursor-pointer ${
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
                    className={`hidden lg:flex h-11 items-center gap-2 rounded-2xl px-5 text-sm font-bold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95 cursor-pointer ${
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
            className="hidden lg:grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-700 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-red-50 hover:text-red-600 active:scale-95 cursor-pointer"
            aria-label="تسجيل الخروج"
          >
            <LogOut size={20} />
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex lg:hidden h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition active:scale-95 cursor-pointer"
            aria-label="قائمة التحكم"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Expandable Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-150/80 bg-white/95 px-6 py-4 rounded-b-[2rem] space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <button
            onClick={() => {
              onViewChange("dashboard");
              setIsMobileMenuOpen(false);
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-right text-sm font-bold transition-colors ${activeView === "dashboard" ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <Users size={16} />
            <span>العملاء (لوحة التحكم)</span>
          </button>

          <button
            onClick={() => {
              onAttendance();
              setIsMobileMenuOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-right text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ClipboardCheck size={16} />
            <span>تحضير المهندسين</span>
          </button>

          {isManager && (
            <>
              <button
                onClick={() => {
                  onViewChange("engineers");
                  setIsMobileMenuOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-right text-sm font-bold transition-colors ${activeView === "engineers" ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <Users size={16} />
                <span>إدارة المهندسين</span>
              </button>

              <button
                onClick={() => {
                  onViewChange("system");
                  setIsMobileMenuOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-right text-sm font-bold transition-colors ${activeView === "system" ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <Database size={16} />
                <span>التقارير والنظام</span>
              </button>
            </>
          )}

          {isSuperAdmin && (
            <>
              <button
                onClick={() => {
                  onViewChange("companies");
                  setIsMobileMenuOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-right text-sm font-bold transition-colors ${activeView === "companies" ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <Building size={16} />
                <span>الشركات المتعاقدة</span>
              </button>

              <button
                onClick={() => {
                  onViewChange("analytics");
                  setIsMobileMenuOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-right text-sm font-bold transition-colors ${activeView === "analytics" ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <TrendingUp size={16} />
                <span>التحليلات المالية</span>
              </button>
            </>
          )}

          {/* تقارير الفحص المبدئية */}
          <div className="border-t border-slate-100 pt-2 mt-2 space-y-1">
            <p className="px-4 text-[10px] font-extrabold text-slate-400">تقارير الفحص اللحظية</p>
            <button
              onClick={() => {
                onOpenBuySellReport();
                setIsMobileMenuOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-right text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <FileText size={16} className="text-slate-400" />
              <span>📄 تقرير فحص بيع وشراء</span>
            </button>
            <button
              onClick={() => {
                onOpenRegularReport();
                setIsMobileMenuOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-right text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Wrench size={16} className="text-slate-400" />
              <span>🛠️ تقرير فحص عادي</span>
            </button>
          </div>

          {/* تسجيل الخروج */}
          <button
            onClick={() => {
              onLogout();
              setIsMobileMenuOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-right text-sm font-bold text-red-650 hover:bg-red-50 transition-colors border-t border-slate-100 pt-2 mt-2"
          >
            <LogOut size={16} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      )}
    </header>
  );
}
