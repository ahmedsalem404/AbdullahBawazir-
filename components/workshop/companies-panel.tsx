"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Building2,
  Plus,
  ArrowLeft,
  MapPin,
  Phone,
  Car,
  FileText,
  Trash2,
  Edit3,
  X,
  ShieldAlert,
  Loader2,
  CheckSquare,
  Square,
  DollarSign,
  Hash,
  Palette,
  Calendar,
  Wrench,
  Package,
  Send,
  Calculator,
  ChevronLeft,
  Sparkles,
  TrendingUp,
  Receipt,
} from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";
import { formatCurrency } from "./constants";
import { ConfirmModal } from "./modals";
import type { Company, CompanyCar, CompanyInvoice } from "@/types/workshop";

/* ──────────────────────────────────────────────────
   CSS Keyframes for modal entrance animations
   ────────────────────────────────────────────────── */
const MODAL_KEYFRAMES = `
  @keyframes modalOpen {
    from { transform: scale(0.92) translateY(12px); opacity: 0; }
    to   { transform: scale(1) translateY(0); opacity: 1; }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .animate-modal-open {
    animation: modalOpen 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
  .animate-fadeInUp {
    animation: fadeInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
`;

export function CompaniesPanel({
  onPreviewInvoice,
}: {
  onPreviewInvoice?: (invoice: CompanyInvoice, company: Company, car: CompanyCar) => void;
}) {
  const {
    companies,
    selectedCompany,
    cars,
    selectedCar,
    invoices,
    isLoading,
    isSaving,
    error,
    toast,
    currentSubView,
    isCompanyModalOpen,
    editingCompany,
    isCarModalOpen,
    isInvoiceModalOpen,
    editingInvoice,
    deleteTargetInvoice,
    deleteTargetCompany,
    setIsCompanyModalOpen,
    setEditingCompany,
    setIsCarModalOpen,
    setIsInvoiceModalOpen,
    setEditingInvoice,
    setDeleteTargetInvoice,
    setDeleteTargetCompany,
    saveCompany,
    deleteCompany,
    saveCar,
    saveInvoice,
    deleteInvoice,
    viewCompanyCars,
    viewCarInvoices,
    navigateBack,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    selectedAccounted,
    setSelectedAccounted,
    selectedSent,
    setSelectedSent,
  } = useCompanies();

  /* ── Local form state ── */
  const [companyForm, setCompanyForm] = useState({ name: "", location: "", contact_number: "" });
  const [carForm, setCarForm] = useState<{ name: string; year: number | ""; color: string; plate_or_chassis: string }>({ name: "", year: "", color: "", plate_or_chassis: "" });
  const [invoiceForm, setInvoiceForm] = useState({
    work_details: "",
    parts_details: "",
    parts_total: "",
    labor_total: "",
    currency: "SAR" as "YER" | "SAR" | "USD",
    is_accounted: false,
    is_sent: false,
  });

  /* ── Form Openers ── */
  const openAddCompany = () => {
    setCompanyForm({ name: "", location: "", contact_number: "" });
    setEditingCompany(null);
    setIsCompanyModalOpen(true);
  };

  const openEditCompany = (company: Company) => {
    setCompanyForm({ name: company.name, location: company.location || "", contact_number: company.contact_number || "" });
    setEditingCompany(company);
    setIsCompanyModalOpen(true);
  };

  const openAddCar = () => {
    setCarForm({ name: "", year: "", color: "", plate_or_chassis: "" });
    setIsCarModalOpen(true);
  };

  const openAddInvoice = () => {
    setInvoiceForm({ work_details: "", parts_details: "", parts_total: "", labor_total: "", currency: "SAR", is_accounted: false, is_sent: false });
    setEditingInvoice(null);
    setIsInvoiceModalOpen(true);
  };

  const openEditInvoice = (inv: CompanyInvoice) => {
    setInvoiceForm({
      work_details: inv.work_details,
      parts_details: inv.parts_details || "",
      parts_total: inv.parts_total.toString(),
      labor_total: inv.labor_total.toString(),
      currency: inv.currency,
      is_accounted: inv.is_accounted,
      is_sent: inv.is_sent,
    });
    setEditingInvoice(inv);
    setIsInvoiceModalOpen(true);
  };

  /* ── Auto-calc grand total ── */
  const partsVal = parseFloat(invoiceForm.parts_total) || 0;
  const laborVal = parseFloat(invoiceForm.labor_total) || 0;
  const grandTotalVal = partsVal + laborVal;

  /* ── Invoice summary stats (computed on-the-fly) ── */
  const invoiceStats = useMemo(() => {
    if (!invoices.length) return null;
    const total = invoices.reduce((s, i) => s + i.grand_total, 0);
    const accounted = invoices.filter((i) => i.is_accounted).length;
    const sent = invoices.filter((i) => i.is_sent).length;
    return { total, accounted, sent, count: invoices.length, currency: invoices[0]?.currency || "SAR" };
  }, [invoices]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8" dir="rtl">
      <style>{MODAL_KEYFRAMES}</style>

      {/* ══════════════════════════════════════════════════════
          BREADCRUMB  +  HEADER  (Apple Double-Bezel)
          ══════════════════════════════════════════════════════ */}
      <section className="w-full rounded-[2rem] border border-slate-200/40 bg-slate-100/50 p-2 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-550 ease-[cubic-bezier(0.32,0.72,0,1)]">
        <div className="w-full rounded-[calc(2rem-0.5rem)] bg-white p-5 sm:p-6 border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left: breadcrumb + title */}
            <div className="space-y-2">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-sm font-bold text-slate-400 select-none">
                <button
                  onClick={() => { if (currentSubView !== "companies") navigateBack(); }}
                  className={`transition-colors duration-200 ${currentSubView === "companies" ? "text-indigo-600 font-extrabold cursor-default" : "hover:text-slate-600 cursor-pointer"}`}
                >
                  🏢 الشركات المتعاقدة
                </button>
                {selectedCompany && (
                  <>
                    <ChevronLeft size={14} className="text-slate-300" />
                    <button
                      onClick={() => { if (currentSubView === "invoices") navigateBack(); }}
                      className={`transition-colors duration-200 ${currentSubView === "cars" ? "text-indigo-600 font-extrabold cursor-default" : "hover:text-slate-600 cursor-pointer"}`}
                    >
                      {selectedCompany.name}
                    </button>
                  </>
                )}
                {selectedCar && (
                  <>
                    <ChevronLeft size={14} className="text-slate-300" />
                    <span className="text-indigo-600 font-extrabold">{selectedCar.name}</span>
                  </>
                )}
              </nav>

              {/* Dynamic Title */}
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 flex-shrink-0">
                  {currentSubView === "companies" && <Building2 size={22} />}
                  {currentSubView === "cars" && <Car size={22} />}
                  {currentSubView === "invoices" && <Receipt size={22} />}
                </div>
                <span>
                  {currentSubView === "companies" && "إدارة أساطيل الشركات المتعاقدة"}
                  {currentSubView === "cars" && `أسطول شركة ${selectedCompany?.name}`}
                  {currentSubView === "invoices" && `سجل صيانة ${selectedCar?.name}`}
                </span>
              </h1>
            </div>

            {/* Right: action button */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {currentSubView === "invoices" && (
                <div className="flex flex-wrap items-center gap-2 select-none">
                  {/* Select Month */}
                  <select
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.target.value);
                      if (e.target.value === "all") {
                        setSelectedYear("all");
                      }
                    }}
                    className="h-10 rounded-2xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-bold text-slate-700 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white cursor-pointer"
                  >
                    <option value="all">كل الأشهر</option>
                    {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((m) => (
                      <option key={m} value={m}>
                        شهر {m}
                      </option>
                    ))}
                  </select>

                  {/* Select Year */}
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="h-10 rounded-2xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-bold text-slate-700 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={selectedMonth === "all"}
                  >
                    <option value="all">كل السنوات</option>
                    {Array.from({ length: new Date().getFullYear() - 2024 + 1 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <option key={year} value={year.toString()}>
                          {year}
                        </option>
                      );
                    })}
                  </select>

                  {/* Accounted Filter */}
                  <select
                    value={selectedAccounted}
                    onChange={(e) => setSelectedAccounted(e.target.value)}
                    className="h-10 rounded-2xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-bold text-slate-700 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white cursor-pointer"
                  >
                    <option value="all">كل الحسابات</option>
                    <option value="true">محاسب</option>
                    <option value="false">غير محاسب</option>
                  </select>

                  {/* Sent Filter */}
                  <select
                    value={selectedSent}
                    onChange={(e) => setSelectedSent(e.target.value)}
                    className="h-10 rounded-2xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-bold text-slate-700 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white cursor-pointer"
                  >
                    <option value="all">كل الإرساليات</option>
                    <option value="true">تم الإرسال</option>
                    <option value="false">لم يرسل</option>
                  </select>
                </div>
              )}

              {currentSubView !== "companies" && (
                <button
                  onClick={navigateBack}
                  className="group inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm transition-all duration-300 hover:bg-slate-50 active:scale-95 cursor-pointer"
                >
                  <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                  رجوع
                </button>
              )}

              <button
                onClick={currentSubView === "companies" ? openAddCompany : currentSubView === "cars" ? openAddCar : openAddInvoice}
                className="group inline-flex h-11 items-center justify-center gap-3 rounded-full bg-indigo-600 pl-2 pr-5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(99,102,241,0.3)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-indigo-700 hover:shadow-[0_6px_20px_rgba(99,102,241,0.35)] active:scale-95 cursor-pointer"
              >
                {currentSubView === "companies" && "إضافة شركة جديدة"}
                {currentSubView === "cars" && "إضافة سيارة"}
                {currentSubView === "invoices" && "إنشاء فاتورة صيانة"}
                <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                  <Plus size={16} />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          LOADING / ERROR STATES
          ══════════════════════════════════════════════════════ */}
      {isLoading && (
        <div className="flex min-h-[350px] flex-col items-center justify-center gap-4 rounded-[2rem] border border-slate-200/40 bg-slate-100/50 p-2">
          <div className="rounded-[calc(2rem-0.5rem)] bg-white p-12 border border-white/60 w-full flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-indigo-500 h-10 w-10" />
            <p className="text-slate-500 font-bold text-sm">جاري تحميل البيانات...</p>
          </div>
        </div>
      )}

      {error && !isLoading && (
        <div className="rounded-[2rem] border border-red-200/50 bg-red-50/30 p-2">
          <div className="rounded-[calc(2rem-0.5rem)] bg-white p-8 border border-white/60 text-center space-y-3">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-500">
              <ShieldAlert size={28} />
            </div>
            <h3 className="text-lg font-extrabold text-red-800">فشل تحميل البيانات</h3>
            <p className="text-sm font-medium text-red-600/80 leading-relaxed max-w-md mx-auto">{error}</p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          MAIN CONTENT VIEWS
          ══════════════════════════════════════════════════════ */}
      {!isLoading && !error && (
        <>
          {/* ─────── 1. Companies Grid ─────── */}
          {currentSubView === "companies" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {companies.length === 0 ? (
                <div className="col-span-full rounded-[2rem] border border-slate-200/40 bg-slate-100/50 p-2">
                  <div className="rounded-[calc(2rem-0.5rem)] bg-white p-16 border border-white/60 text-center">
                    <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-indigo-50 text-indigo-400 mb-5">
                      <Building2 size={36} />
                    </div>
                    <h3 className="text-lg font-black text-slate-700">لا يوجد شركات مسجلة بعد</h3>
                    <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">اضغط على زر "إضافة شركة جديدة" في الأعلى لبدء إدارة أساطيل الشركات المتعاقدة.</p>
                  </div>
                </div>
              ) : (
                companies.map((company, idx) => (
                  <div
                    key={company.id}
                    className="animate-fadeInUp group rounded-[2rem] border border-slate-200/40 bg-slate-100/50 p-2 shadow-[0_8px_30px_rgb(0,0,0,0.015)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_14px_45px_rgb(0,0,0,0.045)] hover:-translate-y-1"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <div className="h-full rounded-[calc(2rem-0.5rem)] bg-white p-5 border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] flex flex-col">
                      {/* Top: gradient icon circle + name + actions */}
                      <div className="flex justify-between items-start gap-3">
                        <div onClick={() => viewCompanyCars(company)} className="flex items-start gap-3.5 flex-1 cursor-pointer">
                          <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.25)]">
                            <Building2 size={22} />
                          </div>
                          <div className="space-y-1 pt-0.5">
                            <h3 className="text-base font-extrabold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors duration-300">
                              {company.name}
                            </h3>
                            <div className="space-y-1 text-xs font-semibold text-slate-450">
                              {company.location && (
                                <div className="flex items-center gap-1.5">
                                  <MapPin size={12} className="text-slate-350" />
                                  <span>{company.location}</span>
                                </div>
                              )}
                              {company.contact_number && (
                                <div className="flex items-center gap-1.5">
                                  <Phone size={12} className="text-slate-350" />
                                  <span dir="ltr">{company.contact_number}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => openEditCompany(company)}
                            className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 active:scale-90 cursor-pointer"
                            title="تعديل الشركة"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTargetCompany(company)}
                            className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200 active:scale-90 cursor-pointer"
                            title="حذف الشركة"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Bottom CTA */}
                      <div className="mt-auto pt-4">
                        <button
                          onClick={() => viewCompanyCars(company)}
                          className="w-full flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-xs font-extrabold text-indigo-600 transition-all duration-300 hover:bg-indigo-50 hover:border-indigo-100 active:scale-[0.98] cursor-pointer group/btn"
                        >
                          <span className="flex items-center gap-2">
                            <Car size={15} className="text-indigo-500" />
                            عرض المركبات والأسطول
                          </span>
                          <ArrowLeft size={14} className="group-hover/btn:-translate-x-1 transition-transform duration-300" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ─────── 2. Cars Table (Double-Bezel) ─────── */}
          {currentSubView === "cars" && selectedCompany && (
            <section className="w-full rounded-[2rem] border border-slate-200/40 bg-slate-100/50 p-2 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-550 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.04)]">
              <div className="w-full rounded-[calc(2rem-0.5rem)] bg-white p-0 border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] border-collapse text-right">
                    <thead>
                      <tr className="bg-slate-50/80 text-xs font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                        <th className="px-6 py-5 font-bold">
                          <span className="flex items-center gap-2"><Car size={14} className="text-slate-400" />اسم السيارة/الموديل</span>
                        </th>
                        <th className="px-6 py-5 font-bold">
                          <span className="flex items-center gap-2"><Hash size={14} className="text-slate-400" />رقم اللوحة / الشاصيه</span>
                        </th>
                        <th className="px-6 py-5 font-bold">
                          <span className="flex items-center gap-2"><Calendar size={14} className="text-slate-400" />الموديل</span>
                        </th>
                        <th className="px-6 py-5 font-bold">
                          <span className="flex items-center gap-2"><Palette size={14} className="text-slate-400" />اللون</span>
                        </th>
                        <th className="px-6 py-5 font-bold w-32 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80">
                      {cars.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-16 text-center">
                            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-50 text-slate-300 mb-3">
                              <Car size={28} />
                            </div>
                            <p className="text-sm font-bold text-slate-400">لا يوجد سيارات مسجلة لهذه الشركة حالياً.</p>
                          </td>
                        </tr>
                      ) : (
                        cars.map((car) => (
                          <tr
                            key={car.id}
                            className="transition-all duration-200 hover:bg-indigo-50/30 cursor-pointer group"
                            onClick={() => viewCarInvoices(car)}
                          >
                            <td className="px-6 py-5">
                              <span className="text-base font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors">{car.name}</span>
                            </td>
                            <td className="px-6 py-5 text-base font-semibold text-slate-600" dir="ltr">{car.plate_or_chassis}</td>
                            <td className="px-6 py-5">
                              <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600 border border-slate-100">
                                {car.year}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              {car.color ? (
                                <span className="inline-flex items-center gap-2">
                                  <span className="h-4 w-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: getHexColor(car.color) }} />
                                  <span className="text-sm font-bold text-slate-600">{car.color}</span>
                                </span>
                              ) : (
                                <span className="text-xs font-semibold text-slate-350">غير محدد</span>
                              )}
                            </td>
                            <td className="px-6 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => viewCarInvoices(car)}
                                className="inline-flex h-9 items-center gap-2 rounded-xl bg-indigo-50 px-3.5 text-xs text-indigo-700 hover:bg-indigo-100 font-extrabold transition-all duration-200 active:scale-95 cursor-pointer border border-indigo-100/50"
                              >
                                <FileText size={13} />
                                سجل الفواتير
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* ─────── 3. Invoices View (Summary Cards + Double-Bezel Table) ─────── */}
          {currentSubView === "invoices" && selectedCar && (
            <div className="space-y-5">
              {/* Summary stat cards (Bento Grid) */}
              {invoiceStats && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Invoice count */}
                  <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-4 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-600/80">
                      <FileText size={14} />
                      <span>عدد الفواتير</span>
                    </div>
                    <p className="text-lg font-black text-indigo-800">{invoiceStats.count} فاتورة</p>
                  </div>
                  {/* Accounted */}
                  <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-600/80">
                      <Calculator size={14} />
                      <span>تمت المحاسبة</span>
                    </div>
                    <p className="text-lg font-black text-amber-800">{invoiceStats.accounted} / {invoiceStats.count}</p>
                  </div>
                  {/* Sent */}
                  <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600/80">
                      <Send size={14} />
                      <span>تم الإرسال</span>
                    </div>
                    <p className="text-lg font-black text-blue-800">{invoiceStats.sent} / {invoiceStats.count}</p>
                  </div>
                </div>
              )}

              {/* Invoices table */}
              <section className="w-full rounded-[2rem] border border-slate-200/40 bg-slate-100/50 p-2 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-550 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.04)]">
                <div className="w-full rounded-[calc(2rem-0.5rem)] bg-white p-0 border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] border-collapse text-right">
                      <thead>
                        <tr className="bg-slate-50/80 text-xs font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                          <th className="px-5 py-5 font-bold"><span className="flex items-center gap-1.5"><Wrench size={13} className="text-slate-400"/>تفاصيل العمل</span></th>
                          <th className="px-5 py-5 font-bold"><span className="flex items-center gap-1.5"><Package size={13} className="text-slate-400"/>القطع</span></th>
                          <th className="px-5 py-5 font-bold">الفرع</th>
                          <th className="px-5 py-5 font-bold">سعر القطع</th>
                          <th className="px-5 py-5 font-bold">سعر العمل</th>
                          <th className="px-5 py-5 font-bold">المجموع الكلي</th>
                          <th className="px-5 py-5 font-bold text-center w-24">المحاسبة</th>
                          <th className="px-5 py-5 font-bold text-center w-24">الإرسال</th>
                          <th className="px-5 py-5 font-bold text-center w-24">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/80">
                        {invoices.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-16 text-center">
                              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-50 text-slate-300 mb-3">
                                <FileText size={28} />
                              </div>
                              <p className="text-sm font-bold text-slate-400">لا يوجد فواتير صيانة لهذه السيارة بعد.</p>
                            </td>
                          </tr>
                        ) : (
                          invoices.map((inv) => (
                            <tr key={inv.id} className="transition-all duration-200 hover:bg-indigo-50/20 group">
                              <td className="px-5 py-4 text-sm font-semibold text-slate-700 max-w-[200px] truncate" title={inv.work_details}>{inv.work_details}</td>
                              <td className="px-5 py-4 text-sm font-medium text-slate-500 max-w-[180px] truncate" title={inv.parts_details || ""}>{inv.parts_details || "—"}</td>
                              <td className="px-5 py-4">
                                {inv.branch ? (
                                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600 border border-slate-100">
                                    <MapPin size={11} />
                                    {inv.branch}
                                  </span>
                                ) : "—"}
                              </td>
                              <td className="px-5 py-4 text-sm font-bold font-mono text-slate-600">{formatCurrency(inv.parts_total, inv.currency)}</td>
                              <td className="px-5 py-4 text-sm font-bold font-mono text-slate-600">{formatCurrency(inv.labor_total, inv.currency)}</td>
                              <td className="px-5 py-4 text-sm font-black font-mono text-emerald-700">{formatCurrency(inv.grand_total, inv.currency)}</td>
                              <td className="px-5 py-4 text-center">
                                {inv.is_accounted ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold text-emerald-700 border border-emerald-100">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    محاسب
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-extrabold text-amber-700 border border-amber-100">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    غير محاسب
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-4 text-center">
                                {inv.is_sent ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-extrabold text-blue-700 border border-blue-100">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                    تم الإرسال
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-extrabold text-slate-500 border border-slate-100">
                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                    لم يرسل
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-4 text-center">
                                <div className="flex justify-center gap-1">
                                  <button
                                    onClick={() => {
                                      if (onPreviewInvoice && selectedCompany && selectedCar) {
                                        onPreviewInvoice(inv, selectedCompany, selectedCar);
                                      }
                                    }}
                                    className="grid h-8 w-8 place-items-center rounded-xl bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-200 active:scale-90 cursor-pointer"
                                    title="معاينة الفاتورة"
                                  >
                                    <FileText size={13} />
                                  </button>
                                  <button
                                    onClick={() => openEditInvoice(inv)}
                                    className="grid h-8 w-8 place-items-center rounded-xl bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 active:scale-90 cursor-pointer"
                                    title="تعديل الفاتورة"
                                  >
                                    <Edit3 size={13} />
                                  </button>
                                  <button
                                    onClick={() => setDeleteTargetInvoice(inv)}
                                    className="grid h-8 w-8 place-items-center rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200 active:scale-90 cursor-pointer"
                                    title="حذف الفاتورة"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════
          MODALS (Apple Glassmorphic Double-Bezel)
          ══════════════════════════════════════════════════════ */}

      {/* ─── 1. Company Modal ─── */}
      {isCompanyModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 px-4 py-6 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-[2.5rem] border border-slate-200/40 bg-slate-100/50 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl animate-modal-open">
            <div className="w-full rounded-[calc(2.5rem-0.5rem)] bg-white p-6 sm:p-8 border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]" dir="rtl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-800">{editingCompany ? "تعديل بيانات الشركة" : "إضافة شركة متعاقدة"}</h3>
                    <p className="text-xs font-semibold text-slate-400">بيانات الشركة الأساسية</p>
                  </div>
                </div>
                <button onClick={() => setIsCompanyModalOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition active:scale-90 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); saveCompany(companyForm); }} className="space-y-5">
                <FormField label="اسم الشركة" required icon={<Building2 size={15} />}>
                  <input type="text" required value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} className={INPUT_CLASS} />
                </FormField>
                <FormField label="العنوان / المقر" icon={<MapPin size={15} />}>
                  <input type="text" value={companyForm.location} onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })} className={INPUT_CLASS} />
                </FormField>
                <FormField label="رقم الهاتف للتواصل" icon={<Phone size={15} />}>
                  <input type="text" inputMode="tel" pattern="[0-9\-\s]*" value={companyForm.contact_number} onChange={(e) => setCompanyForm({ ...companyForm, contact_number: e.target.value.replace(/[^0-9\-\s]/g, "") })} dir="ltr" className={`${INPUT_CLASS} text-right`} />
                </FormField>
                <ModalActions onCancel={() => setIsCompanyModalOpen(false)} submitLabel={editingCompany ? "حفظ التعديلات" : "إضافة الشركة"} isSaving={isSaving} />
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─── 2. Car Modal ─── */}
      {isCarModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 px-4 py-6 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-[2.5rem] border border-slate-200/40 bg-slate-100/50 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl animate-modal-open">
            <div className="w-full rounded-[calc(2.5rem-0.5rem)] bg-white p-6 sm:p-8 border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]" dir="rtl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm">
                    <Car size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-800">تسجيل سيارة جديدة</h3>
                    <p className="text-xs font-semibold text-slate-400">ضمن أسطول {selectedCompany?.name}</p>
                  </div>
                </div>
                <button onClick={() => setIsCarModalOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition active:scale-90 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); saveCar({ ...carForm, year: Number(carForm.year) || new Date().getFullYear() }); }} className="space-y-5">
                <FormField label="اسم السيارة والموديل" required icon={<Car size={15} />}>
                  <input type="text" required value={carForm.name} onChange={(e) => setCarForm({ ...carForm, name: e.target.value })} placeholder="مثل: Toyota Hilux" className={INPUT_CLASS} />
                </FormField>
                <FormField label="رقم اللوحة / الشاصيه" required icon={<Hash size={15} />}>
                  <input type="text" required value={carForm.plate_or_chassis} onChange={(e) => setCarForm({ ...carForm, plate_or_chassis: e.target.value })} placeholder="مثال: 5392 / أ أو رقم الشاصيه" className={INPUT_CLASS} />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="سنة الصنع" required icon={<Calendar size={15} />}>
                    <input type="number" required min={1950} max={new Date().getFullYear() + 2} value={carForm.year} onChange={(e) => setCarForm({ ...carForm, year: e.target.value === "" ? "" : (parseInt(e.target.value) || "") })} className={INPUT_CLASS} />
                  </FormField>
                  <FormField label="اللون" icon={<Palette size={15} />}>
                    <input type="text" value={carForm.color} onChange={(e) => setCarForm({ ...carForm, color: e.target.value })} placeholder="مثل: أبيض" className={INPUT_CLASS} />
                  </FormField>
                </div>
                <ModalActions onCancel={() => setIsCarModalOpen(false)} submitLabel="إضافة السيارة" isSaving={isSaving} />
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. Invoice Modal ─── */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 px-4 py-6 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-[2.5rem] border border-slate-200/40 bg-slate-100/50 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl animate-modal-open">
            <div className="max-h-[85vh] overflow-y-auto w-full rounded-[calc(2.5rem-0.5rem)] bg-white p-6 sm:p-8 border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]" dir="rtl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-800">{editingInvoice ? "تعديل فاتورة الصيانة" : "فاتورة صيانة أسطول جديدة"}</h3>
                    <p className="text-xs font-semibold text-slate-400">سيارة {selectedCar?.name} • {selectedCompany?.name}</p>
                  </div>
                </div>
                <button onClick={() => setIsInvoiceModalOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition active:scale-90 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!selectedCar) return;
                  saveInvoice({
                    car_id: selectedCar.id,
                    work_details: invoiceForm.work_details,
                    parts_details: invoiceForm.parts_details || null,
                    parts_total: partsVal,
                    labor_total: laborVal,
                    currency: invoiceForm.currency,
                    is_accounted: invoiceForm.is_accounted,
                    is_sent: invoiceForm.is_sent,
                  });
                }}
                className="space-y-5"
              >
                <FormField label="تفاصيل العمل المنجز" required icon={<Wrench size={15} />}>
                  <textarea required rows={3} value={invoiceForm.work_details} onChange={(e) => setInvoiceForm({ ...invoiceForm, work_details: e.target.value })} placeholder="اكتب وصفاً دقيقاً لعمليات الصيانة المنجزة..." className={`${TEXTAREA_CLASS}`} />
                </FormField>
                <FormField label="تفاصيل القطع المستبدلة" icon={<Package size={15} />}>
                  <textarea rows={2} value={invoiceForm.parts_details} onChange={(e) => setInvoiceForm({ ...invoiceForm, parts_details: e.target.value })} placeholder="اكتب أسماء وتفاصيل قطع الغيار..." className={`${TEXTAREA_CLASS}`} />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField label="سعر القطع" icon={<DollarSign size={15} />}>
                    <input type="number" min={0} step="any" value={invoiceForm.parts_total} onChange={(e) => setInvoiceForm({ ...invoiceForm, parts_total: e.target.value })} className={INPUT_CLASS} />
                  </FormField>
                  <FormField label="أجور اليد العاملة" icon={<DollarSign size={15} />}>
                    <input type="number" min={0} step="any" value={invoiceForm.labor_total} onChange={(e) => setInvoiceForm({ ...invoiceForm, labor_total: e.target.value })} className={INPUT_CLASS} />
                  </FormField>
                  <FormField label="عملة الدفع" icon={<Sparkles size={15} />}>
                    <select value={invoiceForm.currency} onChange={(e) => setInvoiceForm({ ...invoiceForm, currency: e.target.value as "YER" | "SAR" | "USD" })} className={`${INPUT_CLASS} cursor-pointer`}>
                      <option value="SAR">ريال سعودي 🇸🇦</option>
                      <option value="YER">ريال يمني 🇾🇪</option>
                      <option value="USD">دولار أمريكي 💵</option>
                    </select>
                  </FormField>
                </div>

                {/* Grand Total Showcase */}
                <div className="rounded-2xl bg-gradient-to-l from-emerald-50 via-emerald-50/50 to-white border border-emerald-100 p-5 flex items-center justify-between select-none">
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
                      <Calculator size={18} />
                    </div>
                    <span className="font-extrabold text-sm text-emerald-800">المجموع الكلي (تلقائي):</span>
                  </div>
                  <span className="font-black text-xl text-emerald-800 font-mono tracking-tight">
                    {formatCurrency(grandTotalVal, invoiceForm.currency)}
                  </span>
                </div>

                {/* Checkboxes with Apple toggle style */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <ToggleCheckbox
                    checked={invoiceForm.is_accounted}
                    onChange={() => setInvoiceForm({ ...invoiceForm, is_accounted: !invoiceForm.is_accounted })}
                    label="تمت محاسبة الفاتورة"
                    activeColor="emerald"
                  />
                  <ToggleCheckbox
                    checked={invoiceForm.is_sent}
                    onChange={() => setInvoiceForm({ ...invoiceForm, is_sent: !invoiceForm.is_sent })}
                    label="تم إرسال الفاتورة"
                    activeColor="blue"
                  />
                </div>

                <ModalActions onCancel={() => setIsInvoiceModalOpen(false)} submitLabel={editingInvoice ? "حفظ التعديلات" : "حفظ الفاتورة"} isSaving={isSaving} />
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Deletion Modals ── */}
      {deleteTargetCompany && (
        <ConfirmModal
          title="حذف الشركة المتعاقدة"
          body={`هل أنت متأكد من حذف شركة (${deleteTargetCompany.name})؟ سيؤدي ذلك لحذف جميع سيارات الشركة وسجلات صيانتها وفواتيرها كلياً ولا يمكن التراجع.`}
          onCancel={() => setDeleteTargetCompany(null)}
          onConfirm={() => deleteCompany(deleteTargetCompany.id)}
        />
      )}
      {deleteTargetInvoice && (
        <ConfirmModal
          title="حذف فاتورة الصيانة"
          body="هل أنت متأكد من حذف فاتورة الصيانة هذه للسيارة؟ لا يمكن التراجع عن هذه العملية."
          onCancel={() => setDeleteTargetInvoice(null)}
          onConfirm={() => deleteInvoice(deleteTargetInvoice.id)}
        />
      )}


      {/* ── Toast Notification ── */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 z-[60] -translate-x-1/2 w-max max-w-[90vw] transition-all duration-300 animate-fadeInUp">
          <div
            className={`flex items-center justify-center gap-3 rounded-2xl border px-6 py-4 backdrop-blur-md text-sm sm:text-base font-extrabold text-center ${
              toast.type === "success"
                ? "border-emerald-200 bg-white/90 text-emerald-800 shadow-[0_10px_35px_-5px_rgba(16,185,129,0.2)]"
                : "border-red-200 bg-white/90 text-red-800 shadow-[0_10px_35px_-5px_rgba(239,68,68,0.2)]"
            }`}
          >
            {toast.type === "success" ? <Sparkles size={16} /> : <ShieldAlert size={16} />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   REUSABLE SUB-COMPONENTS & HELPERS
   ══════════════════════════════════════════════════════ */

/** Shared input class (Apple rounded style) */
const INPUT_CLASS =
  "h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-bold outline-none transition-all duration-200 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50 placeholder:text-slate-350";

const TEXTAREA_CLASS =
  "w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm font-bold outline-none transition-all duration-200 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50 resize-y placeholder:text-slate-350";

/** Labeled form field with icon */
function FormField({ label, required, icon, children }: { label: string; required?: boolean; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-xs font-black text-slate-500">
        {icon && <span className="text-slate-400">{icon}</span>}
        <span>{label}</span>
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

/** Apple-style toggle checkbox */
function ToggleCheckbox({ checked, onChange, label, activeColor }: { checked: boolean; onChange: () => void; label: string; activeColor: "emerald" | "blue" }) {
  const colors = {
    emerald: { bg: "bg-emerald-500", ring: "ring-emerald-200" },
    blue: { bg: "bg-blue-500", ring: "ring-blue-200" },
  };
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex-1 flex items-center gap-3 rounded-2xl border p-3.5 text-sm font-bold transition-all duration-300 cursor-pointer active:scale-[0.98] ${
        checked
          ? `border-${activeColor === "emerald" ? "emerald" : "blue"}-200 bg-${activeColor === "emerald" ? "emerald" : "blue"}-50 text-${activeColor === "emerald" ? "emerald" : "blue"}-800`
          : "border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100"
      }`}
    >
      {/* Toggle pill */}
      <div className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-all duration-300 ${checked ? colors[activeColor].bg : "bg-slate-300"}`}>
        <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-300 ${checked ? "left-0.5" : "left-[1.375rem]"}`} />
      </div>
      <span>{label}</span>
    </button>
  );
}

/** Modal footer with submit + cancel buttons */
function ModalActions({ onCancel, submitLabel, isSaving }: { onCancel: () => void; submitLabel: string; isSaving?: boolean }) {
  return (
    <div className="pt-5 flex gap-3 border-t border-slate-100">
      <button
        type="submit"
        disabled={isSaving}
        className="flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-indigo-600 text-sm font-bold text-white shadow-[0_4px_14px_rgba(99,102,241,0.3)] hover:bg-indigo-700 hover:shadow-[0_6px_20px_rgba(99,102,241,0.35)] active:scale-[0.97] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
      >
        {isSaving ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            <span>جاري الحفظ...</span>
          </>
        ) : (
          <>
            <Sparkles size={16} />
            <span>{submitLabel}</span>
          </>
        )}
      </button>
      <button
        type="button"
        disabled={isSaving}
        onClick={onCancel}
        className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-100 px-6 text-sm font-bold text-slate-500 hover:bg-slate-200 active:scale-[0.97] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
      >
        إلغاء
      </button>
    </div>
  );
}

/** Maps Arabic/English color names to hex for visual display */
function getHexColor(colorName: string): string {
  const n = colorName.trim().toLowerCase();
  if (n.includes("أبيض") || n.includes("white")) return "#f8fafc";
  if (n.includes("أسود") || n.includes("black")) return "#1e293b";
  if (n.includes("أحمر") || n.includes("red")) return "#ef4444";
  if (n.includes("أزرق") || n.includes("blue")) return "#3b82f6";
  if (n.includes("رمادي") || n.includes("gray") || n.includes("grey")) return "#64748b";
  if (n.includes("فضي") || n.includes("silver")) return "#cbd5e1";
  if (n.includes("ذهبي") || n.includes("gold")) return "#fbbf24";
  if (n.includes("أخضر") || n.includes("green")) return "#22c55e";
  if (n.includes("أصفر") || n.includes("yellow")) return "#eab308";
  if (n.includes("بني") || n.includes("brown")) return "#92400e";
  if (n.includes("برتقالي") || n.includes("orange")) return "#f97316";
  return "#e2e8f0";
}
