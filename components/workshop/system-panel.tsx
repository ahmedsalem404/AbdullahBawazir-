"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  Database,
  Search,
  Archive,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertTriangle,
  RefreshCw,
  Droplets,
  Calendar,
  Shield,
} from "lucide-react";
import type { Customer } from "@/lib/types";
import { PAGE_SIZE, formatDate, formatCurrency } from "./constants";
import { StatusBadge } from "./ui-elements";
import { InvoiceModal } from "./modals";

export function SystemPanel({
  isSuperAdmin,
  onDailyReport,
  onMonthlyReport,
  onUsersManagement,
  onBackupCompleted,
}: {
  isSuperAdmin: boolean;
  onDailyReport: () => void;
  onMonthlyReport: () => void;
  onUsersManagement: () => void;
  onBackupCompleted?: () => void;
}) {
  // Backup state
  const [isExporting, setIsExporting] = useState(false);

  // Archive execution state
  const [archiveYear, setArchiveYear] = useState(() => {
    const currentYear = new Date().getFullYear();
    return String(currentYear > 2026 ? currentYear - 1 : 2026);
  });
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveMessage, setArchiveMessage] = useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Archive browser state
  const [browseYear, setBrowseYear] = useState(() => {
    const currentYear = new Date().getFullYear();
    return String(currentYear > 2026 ? currentYear - 1 : 2026);
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [archivedRecords, setArchivedRecords] = useState<Customer[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);
  const [selectedInvoiceCustomer, setSelectedInvoiceCustomer] = useState<Customer | null>(null);

  // Available years for dropdown (starting from 2026 to current year dynamically)
  const startYear = 2026;
  const currentYear = new Date().getFullYear();
  const availableYears: string[] = [];
  for (let y = currentYear; y >= startYear; y--) {
    availableYears.push(String(y));
  }
  if (availableYears.length === 0) {
    availableYears.push("2026");
  }

  // Debounce search query to prevent database spam and UI flickering on keypresses
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch archived records
  async function fetchArchived(searchVal = debouncedSearch) {
    setIsLoadingArchive(true);
    try {
      const query = new URLSearchParams({
        year: browseYear,
        search: searchVal,
        page: String(currentPage),
        pageSize: String(PAGE_SIZE),
      });
      const res = await fetch(`/api/system/archive?${query.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch archive");
      const result = await res.json();
      setArchivedRecords(result.data);
      setTotalRows(result.count);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingArchive(false);
    }
  }

  // Reload archive when filters change
  useEffect(() => {
    fetchArchived(debouncedSearch);
  }, [browseYear, debouncedSearch, currentPage]);

  // Handle Backup Download
  function handleBackup() {
    setIsExporting(true);
    try {
      window.location.href = "/api/system/backup";
      setTimeout(() => {
        if (onBackupCompleted) {
          onBackupCompleted();
        }
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsExporting(false), 2000);
    }
  }

  // Handle Archive Execution
  async function handleArchiveSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmPassword) return;

    setIsArchiving(true);
    setArchiveMessage(null);
    try {
      // 1. Verify password via auth API (check_users or login logic)
      const resAuth = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: "r3lr", 
          password: confirmPassword, 
          branch: "الحسوة" // bypass branch boundary
        }),
      });

      if (!resAuth.ok) {
        setArchiveMessage("⚠️ كلمة المرور المدخلة غير صحيحة. يرجى المحاولة مرة أخرى.");
        setIsArchiving(false);
        return;
      }

      // 2. Perform archiving process
      const res = await fetch("/api/system/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: archiveYear }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Archiving failed");

      setArchiveMessage(result.message);
      setShowConfirmModal(false);
      setConfirmPassword("");
      // Refresh archived table
      fetchArchived();
    } catch (err: any) {
      setArchiveMessage(`❌ فشلت العملية: ${err.message || "حدث خطأ غير متوقع"}`);
    } finally {
      setIsArchiving(false);
    }
  }

  const totalPages = Math.max(Math.ceil(totalRows / PAGE_SIZE), 1);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-slate-100 pb-4">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
          <Database className="text-brand-green h-8 w-8" />
          <span>التقارير وإدارة النظام</span>
        </h1>
        <p className="text-base text-slate-500 font-medium">
          استخراج التقارير اليومية والشهرية المطبوعة، {isSuperAdmin ? "وتهيئة خوادم قاعدة البيانات وتنزيل النسخ وتصدير الأرشيف التاريخي السنوي." : ""}
        </p>
      </div>

      {/* Reports Section */}
      <div className="w-full rounded-[2rem] border border-slate-200/40 bg-slate-100/50 p-2 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-550 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.04)]">
        <div className="w-full rounded-[calc(2rem-0.5rem)] bg-white p-6 sm:p-8 border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="text-brand-green" size={22} />
              <span>استخراج وتقارير الفواتير والعمليات</span>
            </h2>
            <p className="text-sm text-slate-400 font-semibold mt-1">
              قم بتوليد التقارير اليومية المفصلة للعملاء أو التقارير الشهرية المجمعة للإيرادات وتصديرها بصيغة A4 PDF.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={onDailyReport}
              className="flex h-16 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-base font-bold text-slate-700 transition active:scale-[0.98] cursor-pointer"
            >
              <FileText size={20} className="text-slate-500" />
              استخراج التقرير اليومي المطبوع
            </button>
            
            <button
              onClick={onMonthlyReport}
              className="flex h-16 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-base font-bold text-slate-700 transition active:scale-[0.98] cursor-pointer"
            >
              <Calendar size={20} className="text-slate-500" />
              استخراج التقرير الشهري المطبوع
            </button>
          </div>
        </div>
      </div>

      {isSuperAdmin && (
        <>
          {/* Backup and Archive Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Backup Card */}
            <div className="rounded-[2.5rem] border border-slate-200/50 bg-white p-6 sm:p-8 shadow-soft flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <div className="space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Download size={24} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">تنزيل نسخة احتياطية (SQL Dump)</h2>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  قم بتوليد وتحميل ملف النسخة الاحتياطية الفوري بالكامل بصيغة SQL. 
                  يحتوي الملف على جميع بيانات الفواتير، المهندسين، وسجلات الحضور لجميع الفروع، لاستعادته عند الطوارئ.
                </p>
              </div>
              <div className="mt-8 border-t border-slate-50 pt-5">
                <button
                  onClick={handleBackup}
                  disabled={isExporting}
                  className="h-12 w-full rounded-2xl bg-brand-green text-base font-bold text-white shadow-card transition-all duration-300 hover:bg-brand-greenDark active:scale-95 disabled:opacity-60 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  {isExporting ? "جاري توليد ملف SQL..." : "تصدير وتنزيل نسخة SQL الآن"}
                </button>
              </div>
            </div>

            {/* Archiving Execution Card */}
            <div className="rounded-[2.5rem] border border-slate-200/50 bg-white p-6 sm:p-8 shadow-soft flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <div className="space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Archive size={24} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">ترحيل وأرشفة الفواتير السنوية</h2>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  نقل جميع الفواتير المغلقة والمكتملة (المدفوعة بالكامل أو غير المنجزة) في أو قبل العام المختار إلى الأرشيف التاريخي المستقل لتقليص حجم الجداول وتخفيف السيرفر.
                </p>
                
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-sm font-bold text-slate-700">ترحيل فواتير عام:</span>
                  <select
                    value={archiveYear}
                    onChange={(e) => setArchiveYear(e.target.value)}
                    className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-bold outline-none bg-white transition focus:border-blue-500 cursor-pointer"
                  >
                    {availableYears.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <span className="text-xs font-semibold text-slate-400">وما قبله</span>
                </div>
              </div>
              <div className="mt-8 border-t border-slate-50 pt-5">
                <button
                  onClick={() => {
                    setArchiveMessage(null);
                    setShowConfirmModal(true);
                  }}
                  className="h-12 w-full rounded-2xl bg-blue-600 text-base font-bold text-white shadow-card transition-all duration-300 hover:bg-blue-700 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Archive size={18} />
                  أرشفة الفواتير لعام {archiveYear} وما قبله
                </button>
              </div>
            </div>

            {/* User Management Card */}
            <div className="rounded-[2.5rem] border border-slate-200/50 bg-white p-6 sm:p-8 shadow-soft flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <div className="space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Shield size={24} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">إدارة حسابات الموظفين</h2>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  إدارة الصلاحيات وإنشاء وتعديل حسابات الدخول لموظفي الورشة والمدراء في الفروع المختلفة.
                </p>
              </div>
              <div className="mt-8 border-t border-slate-50 pt-5">
                <button
                  onClick={onUsersManagement}
                  className="h-12 w-full rounded-2xl bg-slate-800 text-base font-bold text-white shadow-card transition-all duration-300 hover:bg-slate-900 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Shield size={18} />
                  إدارة حسابات الموظفين الآن
                </button>
              </div>
            </div>

          </div>
        </>
      )}

      {/* Archive Logs and Status messages */}
      {isSuperAdmin && archiveMessage && (
        <div className={`p-4 rounded-2xl border text-sm font-bold text-center animate-fadeIn ${
          archiveMessage.includes("نجاح") || archiveMessage.includes("archivedCount")
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {archiveMessage}
        </div>
      )}

      {/* Archived Records Browser */}
      <div className="rounded-[2.5rem] border border-slate-200 bg-white/60 p-2.5 shadow-soft">
        <div className="rounded-[calc(2.5rem-0.625rem)] bg-white p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-800">مستعرض الأرشيف التاريخي للعملاء</h2>
              <p className="text-xs text-slate-400 font-semibold mt-1">تصفح وابحث في الفواتير المؤرشفة للأعوام السابقة واطبع تقاريرها.</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-500 whitespace-nowrap">عرض عام:</span>
              <select
                value={browseYear}
                onChange={(e) => {
                  setBrowseYear(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-bold outline-none bg-white transition focus:border-brand-green cursor-pointer"
              >
                {availableYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="البحث في الأرشيف باسم العميل أو رقم الهاتف..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="h-12 w-full rounded-2xl border border-slate-200 pr-12 pl-4 text-base outline-none transition focus:border-brand-green focus:ring-4 focus:ring-brand-green/12 font-medium"
            />
          </div>

          {/* Records Grid */}
          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full min-w-[800px] border-collapse text-right">
              <thead>
                <tr className="bg-slate-50/80 text-sm text-slate-700 border-b border-slate-100">
                  <th className="px-4 py-4 font-bold text-center w-12">#</th>
                  <th className="px-6 py-4 font-bold">اسم العميل</th>
                  <th className="px-6 py-4 font-bold">نوع السيارة</th>
                  <th className="px-6 py-4 font-bold">المبلغ المطلوب</th>
                  <th className="px-6 py-4 font-bold">المهندس</th>
                  <th className="px-6 py-4 font-bold">التاريخ التاريخي</th>
                  <th className="px-6 py-4 font-bold">طريقة الدفع</th>
                  <th className="px-6 py-4 font-bold text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className={isLoadingArchive ? "opacity-60" : ""}>
                {archivedRecords.map((customer, index) => {
                  const serialNumber = (currentPage - 1) * PAGE_SIZE + index + 1;
                  return (
                    <tr
                      key={customer.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50/50"
                    >
                      <td className="px-4 py-4 font-bold text-slate-400 text-center w-12">
                        {serialNumber}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <span>{customer.customer_name}</span>
                          {(customer.injectors_amount ?? 0) > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[9px] font-black text-blue-700">
                              <Droplets size={9} className="text-blue-600" />
                              <span>بخاخات</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">{customer.car_type}</td>
                      <td className="px-6 py-4 text-sm font-black text-slate-800">
                        {formatCurrency(customer.required_amount, customer.currency)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-650 font-semibold">
                        {customer.engineer_name || "غير محدد"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-medium" dir="ltr">
                        {formatDate(customer.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-600 border border-slate-200">
                          {customer.payment_method === "Cash" ? "كاش" : customer.payment_method === "Transfer" ? `حوالة - ${customer.transfer_type || ""}` : "يد المدير"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedInvoiceCustomer(customer)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-slate-100 px-3 text-xs font-bold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                        >
                          <FileText size={14} />
                          الفاتورة
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!isLoadingArchive && archivedRecords.length === 0 && (
              <div className="py-12 text-center text-sm font-bold text-slate-400 bg-white">
                لا توجد سجلات مؤرشفة لعام {browseYear} أو تطابق البحث.
              </div>
            )}
          </div>

          {/* Pagination */}
          {archivedRecords.length > 0 && (
            <div className="flex items-center justify-center gap-2 border-t border-slate-100 pt-5">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-700 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
              <span className="rounded-xl bg-brand-green px-3.5 py-1.5 text-xs font-bold text-white shadow-sm">
                {currentPage}
              </span>
              <span className="text-xs font-semibold text-slate-400">/</span>
              <span className="rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-700">
                {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-700 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Viewer Modal */}
      {selectedInvoiceCustomer && (
        <InvoiceModal
          customer={selectedInvoiceCustomer}
          onClose={() => setSelectedInvoiceCustomer(null)}
        />
      )}

      {/* Confirm Password Modal for Archiving */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2.5rem] border border-slate-200 bg-white/60 p-2 shadow-soft transition-all duration-300">
            <form
              onSubmit={handleArchiveSubmit}
              className="rounded-[calc(2.5rem-0.5rem)] bg-white p-6 sm:p-7 space-y-5"
            >
              <div className="flex items-center gap-3 text-amber-600 border-b border-slate-100 pb-3">
                <AlertTriangle size={24} />
                <h3 className="text-lg font-bold text-slate-800">تأكيد عملية الأرشفة</h3>
              </div>
              
              <p className="text-sm text-slate-500 leading-relaxed font-semibold">
                أنت على وشك ترحيل ونقل فواتير عام <span className="font-extrabold text-slate-800">{archiveYear} وما قبله</span> إلى الأرشيف التاريخي. 
                سيتم حذف هذه الفواتير نهائياً من الجدول اليومي الفعال للعمال ولا يمكن تعديلها بعد ذلك.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  يرجى كتابة كلمة مرور السوبر أدمن للتأكيد 🔑
                </label>
                <input
                  type="password"
                  required
                  placeholder="كلمة مرور حساب r3lr"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-brand-green"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmModal(false);
                    setConfirmPassword("");
                  }}
                  className="h-11 rounded-xl px-5 text-sm font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isArchiving}
                  className="h-11 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-card transition hover:bg-blue-700 disabled:opacity-60 cursor-pointer flex items-center gap-2"
                >
                  {isArchiving ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      جاري الترحيل...
                    </>
                  ) : (
                    "تأكيد والبدء بالأرشفة"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
