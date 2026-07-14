"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Database,
  Users,
  Wrench,
  DollarSign,
  ChevronLeft,
  Calendar,
  AlertCircle,
  Building,
  RefreshCw,
  Droplets,
} from "lucide-react";
import { formatCurrency } from "./constants";

interface EngineerPerformance {
  name: string;
  carsCount: number;
  YER: number;
  SAR: number;
  USD: number;
}

interface CarModelData {
  name: string;
  count: number;
}

interface CarBrandData {
  brand: string;
  total: number;
  models: CarModelData[];
}

interface CurrencyKPI {
  total: number;
  paid: number;
  debt: number;
}

interface DashboardData {
  totalCars: number;
  injectorsCount: number;
  financials: Record<"YER" | "SAR" | "USD", CurrencyKPI>;
  branches: Record<string, { YER: number; SAR: number; USD: number; cars: number }>;
  engineers: EngineerPerformance[];
  carBrands: CarBrandData[];
}

export function DashboardPanel() {
  const [activeCurrency, setActiveCurrency] = useState<"YER" | "SAR" | "USD">("YER");
  const [dateRange, setDateRange] = useState<"today" | "week" | "month" | "year" | "all" | "custom">("custom");
  
  // Date filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Precise filters
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedDay, setSelectedDay] = useState("all");
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Drilldown state for car brands
  const [selectedBrand, setSelectedBrand] = useState<CarBrandData | null>(null);

  // Calculate dates when range changes
  useEffect(() => {
    if (dateRange === "custom") return;

    setSelectedYear("all");
    setSelectedMonth("all");
    setSelectedDay("all");

    if (dateRange === "all") {
      setStartDate("");
      setEndDate("");
      return;
    }

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    if (dateRange === "today") {
      // Keep today's date
    } else if (dateRange === "week") {
      start.setDate(start.getDate() - 7);
    } else if (dateRange === "month") {
      start.setDate(start.getDate() - 30);
    } else if (dateRange === "year") {
      start.setDate(start.getDate() - 365);
    }

    const tzOffset = new Date().getTimezoneOffset() * 60000;
    const localStart = new Date(start.getTime() - tzOffset).toISOString().slice(0, 10);
    const localEnd = new Date(end.getTime() - tzOffset).toISOString().slice(0, 10);

    setStartDate(localStart);
    setEndDate(localEnd);
  }, [dateRange]);

  // Handle manual dropdown changes
  useEffect(() => {
    if (selectedYear === "all") {
      if (dateRange === "custom") {
        setDateRange("all");
      }
      return;
    }

    setDateRange("custom");

    const y = parseInt(selectedYear);
    let startStr = "";
    let endStr = "";

    if (selectedMonth !== "all") {
      const m = parseInt(selectedMonth);
      if (selectedDay !== "all") {
        const d = parseInt(selectedDay);
        const mm = String(m).padStart(2, "0");
        const dd = String(d).padStart(2, "0");
        startStr = `${y}-${mm}-${dd}`;
        endStr = `${y}-${mm}-${dd}`;
      } else {
        const mm = String(m).padStart(2, "0");
        const lastDay = new Date(y, m, 0).getDate();
        startStr = `${y}-${mm}-01`;
        endStr = `${y}-${mm}-${String(lastDay).padStart(2, "0")}`;
      }
    } else {
      startStr = `${y}-01-01`;
      endStr = `${y}-12-31`;
    }

    setStartDate(startStr);
    setEndDate(endStr);
  }, [selectedYear, selectedMonth, selectedDay]);

  // Fetch Dashboard Statistics
  async function fetchStats() {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (startDate && endDate) {
        // Convert to ISO strings for exact DB matches
        params.set("start", new Date(`${startDate}T00:00:00.000Z`).toISOString());
        params.set("end", new Date(`${endDate}T23:59:59.999Z`).toISOString());
      }

      const res = await fetch(`/api/system/dashboard?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load statistics");
      const result = await res.json();
      setData(result);

      // Refresh drilldown reference if selected
      if (selectedBrand) {
        const updatedBrand = result.carBrands.find(
          (b: CarBrandData) => b.brand === selectedBrand.brand
        );
        setSelectedBrand(updatedBrand || null);
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء تحميل البيانات");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate]);

  if (isLoading && !data) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-3">
        <RefreshCw className="animate-spin text-brand-green h-12 w-12" />
        <p className="text-base font-bold text-slate-500">جاري إعداد لوحة التحليلات والمقارنات...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-800 space-y-4">
        <AlertCircle className="mx-auto h-12 w-12 text-red-600" />
        <h3 className="text-lg font-bold">فشل تحميل التحليلات</h3>
        <p className="text-sm font-medium leading-relaxed">{error || "حدث خطأ غير متوقع"}</p>
        <button
          onClick={fetchStats}
          className="h-10 rounded-xl bg-red-600 px-5 text-sm font-bold text-white shadow-md hover:bg-red-700 transition active:scale-95"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const currentFinancial = data.financials[activeCurrency];

  // Helper for percentage changes relative to sum
  const totalRevenueSum = (data.branches["الحسوة"]?.[activeCurrency] || 0) + (data.branches["الدرين"]?.[activeCurrency] || 0);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8 animate-fadeIn">
      
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <TrendingUp className="text-brand-green h-8 w-8" />
            <span>لوحة التحليلات الذكية للمدير العام</span>
          </h1>
          <p className="text-sm text-slate-500 font-semibold mt-1">
            مؤشرات أداء المركز المالي والتشغيلي، مقارنات الفروع، وتصنيفات كفاءة المهندسين.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Currency Toggle */}
          <div className="flex rounded-xl bg-slate-100 p-1 select-none">
            {(["YER", "SAR", "USD"] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setActiveCurrency(curr)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-black transition-all ${
                  activeCurrency === curr
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {curr === "YER" ? "يمني 🇾🇪" : curr === "SAR" ? "سعودي 🇸🇦" : "دولار 💵"}
              </button>
            ))}
          </div>

          {/* Precise Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-100 p-1 select-none">
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setSelectedMonth("all");
                setSelectedDay("all");
              }}
              className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none border-none cursor-pointer"
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

            <select
              value={selectedMonth}
              disabled={selectedYear === "all"}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setSelectedDay("all");
              }}
              className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none border-none disabled:opacity-55 disabled:cursor-not-allowed cursor-pointer"
            >
              <option value="all">كل الأشهر</option>
              {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((m) => (
                <option key={m} value={m}>
                  شهر {m}
                </option>
              ))}
            </select>

            <select
              value={selectedDay}
              disabled={selectedYear === "all" || selectedMonth === "all"}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none border-none disabled:opacity-55 disabled:cursor-not-allowed cursor-pointer"
            >
              <option value="all">كل الأيام</option>
              {Array.from({ length: 31 }, (_, i) => String(i + 1)).map((d) => (
                <option key={d} value={d}>
                  يوم {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* KPI 1: Total Cars */}
        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-soft hover:shadow-md transition duration-300">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400">إجمالي السيارات المنجزة</span>
              <p className="text-3xl font-black text-slate-800">{data.totalCars}</p>
            </div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Wrench size={22} />
            </div>
          </div>
        </div>

        {/* KPI 2: Total Revenue */}
        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-soft hover:shadow-md transition duration-300">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400">إجمالي الدخل المحصل</span>
              <p className="text-2xl font-black text-emerald-600 leading-snug">
                {formatCurrency(currentFinancial.paid, activeCurrency)}
              </p>
            </div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <DollarSign size={22} />
            </div>
          </div>
        </div>

        {/* KPI 3: Outstanding Debts */}
        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-soft hover:shadow-md transition duration-300">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400">مستحقات معلقة (ديون)</span>
              <p className="text-2xl font-black text-orange-600 leading-snug">
                {formatCurrency(currentFinancial.debt, activeCurrency)}
              </p>
            </div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              <AlertCircle size={22} />
            </div>
          </div>
        </div>

        {/* KPI 4: Injectors Cleaning */}
        <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-soft hover:shadow-md transition duration-300">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400">خدمات تنظيف البخاخات</span>
              <p className="text-3xl font-black text-indigo-600">{data.injectorsCount}</p>
            </div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Droplets size={22} className="animate-pulse" />
            </div>
          </div>
        </div>

      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Branch comparison and Car Brand Drilldown */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Branch Comparison Chart */}
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-soft">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Building size={20} className="text-brand-green" />
              مقارنة حجم الدخل وعدد السيارات بين الفروع
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Visual Bars Comparison */}
              <div className="space-y-5">
                {["الحسوة", "الدرين"].map((bName) => {
                  const branchPaid = data.branches[bName]?.[activeCurrency] || 0;
                  const pct = totalRevenueSum > 0 ? (branchPaid / totalRevenueSum) * 100 : 0;
                  const cars = data.branches[bName]?.cars || 0;

                  return (
                    <div key={bName} className="space-y-2">
                      <div className="flex items-center justify-between text-sm font-bold text-slate-700">
                        <span>فرع {bName}</span>
                        <span>{formatCurrency(branchPaid, activeCurrency)}</span>
                      </div>
                      
                      {/* Progress bar container */}
                      <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden relative">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${
                            bName === "الحسوة" ? "bg-brand-green" : "bg-blue-600"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                        <span>المشاركة المالية: {pct.toFixed(1)}%</span>
                        <span>إجمالي السيارات: {cars} سيارة</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Graphical Box comparison */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 flex flex-col justify-around h-full min-h-[160px]">
                <p className="text-sm font-bold text-slate-500 text-center leading-relaxed">
                  مشاركة الفروع المالية لعملة الدفع النشطة:
                </p>
                <div className="flex justify-around items-center pt-4">
                  <div className="text-center">
                    <span className="inline-block h-3.5 w-3.5 rounded-full bg-brand-green mr-1.5" />
                    <span className="text-xs font-bold text-slate-400">الحسوة</span>
                    <p className="text-lg font-black text-slate-800">
                      {((data.branches["الحسوة"]?.[activeCurrency] || 0) / (totalRevenueSum || 1) * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-200" />
                  <div className="text-center">
                    <span className="inline-block h-3.5 w-3.5 rounded-full bg-blue-600 mr-1.5" />
                    <span className="text-xs font-bold text-slate-400">الدرين</span>
                    <p className="text-lg font-black text-slate-800">
                      {((data.branches["الدرين"]?.[activeCurrency] || 0) / (totalRevenueSum || 1) * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Car Brands & Models Drilldown Panel */}
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-soft">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Database size={20} className="text-brand-green" />
                  تحليلات ماركات وموديلات السيارات
                </h2>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  {selectedBrand ? `توزيع موديلات سيارات: ${selectedBrand.brand}` : "توزيع الماركات والشركات الأكثر صيانة بالورشة"}
                </p>
              </div>

              {selectedBrand && (
                <button
                  onClick={() => setSelectedBrand(null)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-slate-100 px-3 text-xs font-bold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  الرجوع للشركات
                </button>
              )}
            </div>

            {/* List of Brands / Models */}
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {!selectedBrand ? (
                // Level 1: List Brands
                data.carBrands.map((b) => {
                  const maxTotal = data.carBrands[0]?.total || 1;
                  const pct = (b.total / maxTotal) * 100;
                  const sharePct = (b.total / data.totalCars) * 100;

                  return (
                    <div
                      key={b.brand}
                      onClick={() => setSelectedBrand(b)}
                      className="group p-3 rounded-2xl border border-slate-100 hover:border-brand-green/30 hover:bg-slate-50/50 transition cursor-pointer flex items-center justify-between gap-4"
                    >
                      <div className="flex-1 space-y-1.5">
                        <div className="flex justify-between text-sm font-bold text-slate-800">
                          <span>{b.brand}</span>
                          <span className="text-slate-400 text-xs font-semibold">{b.total} سيارة ({sharePct.toFixed(0)}%)</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-brand-green transition-all duration-500 group-hover:bg-brand-greenDark"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <ChevronLeft size={16} className="text-slate-300 group-hover:text-brand-green transition" />
                    </div>
                  );
                })
              ) : (
                // Level 2: List Models of Selected Brand
                selectedBrand.models.map((m) => {
                  const maxModelTotal = selectedBrand.models[0]?.count || 1;
                  const pct = (m.count / maxModelTotal) * 100;
                  const modelShare = (m.count / selectedBrand.total) * 100;

                  return (
                    <div
                      key={m.name}
                      className="p-3 rounded-2xl border border-slate-100 bg-slate-50/20 flex items-center justify-between gap-4"
                    >
                      <div className="flex-1 space-y-1.5">
                        <div className="flex justify-between text-sm font-bold text-slate-800">
                          <span>{m.name === "عام" ? "عام / غير محدد" : m.name}</span>
                          <span className="text-slate-400 text-xs font-semibold">{m.count} سيارة ({modelShare.toFixed(0)}%)</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {data.carBrands.length === 0 && (
                <div className="py-12 text-center text-sm font-bold text-slate-400">
                  لا توجد فواتير صيانة سيارات مسجلة للفترة المحددة.
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Right 1 Column: Engineers Efficiency */}
        <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-soft h-full">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Users size={20} className="text-brand-green" />
            أداء وإنتاجية المهندسين المسؤولين
          </h2>

          <div className="space-y-6 max-h-[600px] overflow-y-auto pr-1">
            {data.engineers.map((eng) => {
              const maxCars = data.engineers[0]?.carsCount || 1;
              const barPct = (eng.carsCount / maxCars) * 100;
              const revenue = eng[activeCurrency] || 0;

              return (
                <div key={eng.name} className="space-y-2 border-b border-slate-50 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-extrabold text-slate-800">{eng.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                        السيارات المنجزة: {eng.carsCount} سيارة
                      </p>
                    </div>
                    <span className="text-xs font-black text-slate-800">
                      {formatCurrency(revenue, activeCurrency)}
                    </span>
                  </div>

                  {/* Progress Indicator */}
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-green transition-all duration-700 ease-out"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {data.engineers.length === 0 && (
              <div className="py-16 text-center text-sm font-bold text-slate-400">
                لا توجد سجلات حضور أو صيانة للمهندسين بالفترة المحددة.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
