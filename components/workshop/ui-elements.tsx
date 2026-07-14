"use client";
import React from "react";
import type { Customer } from "@/lib/types";
import { formatCurrency } from "./constants";

/**
 * @component StatusBadge
 * @description مكون لعرض حالة الدفع للعميل بشكل مرئي (مدفوع بالكامل أو رصيد مستحق).
 */
export function StatusBadge({ status }: { status: Customer["status"] }) {
  let bgClass = "bg-orange-100 text-orange-700";
  if (status === "مدفوع") {
    bgClass = "bg-emerald-100 text-emerald-700";
  } else if (status === "لم يتم العمل") {
    bgClass = "bg-red-100 text-red-700 border border-red-200";
  }
  return (
    <span
      className={`inline-flex min-w-28 items-center justify-center rounded-full px-3 py-1.5 text-sm font-bold ${bgClass}`}
    >
      {status}
    </span>
  );
}

/**
 * @component TextField
 * @description مكون حقل إدخال نصي (Text Input) قابل لإعادة الاستخدام في النماذج.
 */
export function TextField({
  label,
  value,
  onChange,
  required,
  inputProps,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}) {
  return (
    <label className="block text-right">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="h-12 w-full rounded-2xl border border-brand-line bg-white px-4 text-base outline-none transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus:border-brand-green focus:ring-4 focus:ring-brand-green/12"
        {...inputProps}
      />
    </label>
  );
}

/**
 * @component NumberField
 * @description مكون حقل إدخال رقمي (Number Input) قابل لإعادة الاستخدام في النماذج.
 */
export function NumberField({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  required?: boolean;
}) {
  return (
    <label className="block text-right">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <input
        value={value === 0 ? "" : value}
        type="number"
        min={0}
        step="1"
        onChange={(event) => {
          const val = event.target.value;
          if (val === "") {
            onChange(0);
          } else {
            const num = parseFloat(val);
            onChange(isNaN(num) ? 0 : Math.round(num));
          }
        }}
        onBlur={(event) => {
          const val = event.target.value;
          if (val !== "") {
            const num = parseFloat(val);
            onChange(isNaN(num) ? 0 : Math.round(num));
          }
        }}
        required={required}
        className="h-12 w-full appearance-none rounded-2xl border border-brand-line bg-white px-4 text-base outline-none transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus:border-brand-green focus:ring-4 focus:ring-brand-green/12 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
      />
    </label>
  );
}

/**
 * @component FinancialCard
 * @description بطاقة لعرض الملخص المالي (إجمالي المدفوعات).
 */
export function FinancialCard({
  totalPaid,
  isToday,
}: {
  totalPaid: number;
  isToday: boolean;
}) {
  return (
    <aside className="self-end rounded-apple border border-white bg-brand-green px-6 py-5 text-white shadow-soft">
      <p className="text-sm font-semibold opacity-90">
        {isToday ? "إجمالي المدفوع لليوم" : "إجمالي المدفوع"}
      </p>
      <strong className="mt-2 block text-3xl">
        {formatCurrency(totalPaid)}
      </strong>
    </aside>
  );
}

/**
 * @component InvoiceItem
 * @description عنصر فرعي يعرض قيمة معينة داخل الفاتورة (مثل اسم العميل، المبلغ...).
 */
export function InvoiceItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-l border-slate-200 p-3">
      <dt className="text-xs font-bold text-brand-muted">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}

export type FinancialBreakdown = {
  Cash: { YER: number; SAR: number; USD: number };
  Transfer: { YER: number; SAR: number; USD: number };
  Manager_Hand: { YER: number; SAR: number; USD: number };
};

export function FinancialBreakdownCards({
  breakdown,
}: {
  breakdown: FinancialBreakdown;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-3 w-full">
      {/* الكاش */}
      <div className="w-full rounded-[2rem] border border-slate-200 bg-white/60 p-2 shadow-soft backdrop-blur-sm transition-all duration-300">
        <div className="w-full rounded-[calc(2rem-0.5rem)] bg-white p-5 text-right">
          <h3 className="text-sm font-bold text-slate-500 mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-base font-extrabold text-slate-800">إجمالي الكاش 💵</span>
          </h3>
          <div className="space-y-2 text-base font-semibold">
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="text-slate-400 text-sm font-bold">ريال يمني:</span>
              <span className="text-slate-700 font-extrabold">{formatCurrency(breakdown.Cash.YER, "YER")}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="text-slate-400 text-sm font-bold">ريال سعودي:</span>
              <span className="text-slate-700 font-extrabold">{formatCurrency(breakdown.Cash.SAR, "SAR")}</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-slate-400 text-sm font-bold">دولار أمريكي:</span>
              <span className="text-slate-700 font-extrabold">{formatCurrency(breakdown.Cash.USD, "USD")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* الحوالات */}
      <div className="w-full rounded-[2rem] border border-slate-200 bg-white/60 p-2 shadow-soft backdrop-blur-sm transition-all duration-300">
        <div className="w-full rounded-[calc(2rem-0.5rem)] bg-white p-5 text-right">
          <h3 className="text-sm font-bold text-slate-500 mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-base font-extrabold text-slate-800">إجمالي الحوالات 🔄</span>
          </h3>
          <div className="space-y-2 text-base font-semibold">
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="text-slate-400 text-sm font-bold">ريال يمني:</span>
              <span className="text-slate-700 font-extrabold">{formatCurrency(breakdown.Transfer.YER, "YER")}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="text-slate-400 text-sm font-bold">ريال سعودي:</span>
              <span className="text-slate-700 font-extrabold">{formatCurrency(breakdown.Transfer.SAR, "SAR")}</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-slate-400 text-sm font-bold">دولار أمريكي:</span>
              <span className="text-slate-700 font-extrabold">{formatCurrency(breakdown.Transfer.USD, "USD")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* يد المدير */}
      <div className="w-full rounded-[2rem] border border-slate-200 bg-white/60 p-2 shadow-soft backdrop-blur-sm transition-all duration-300">
        <div className="w-full rounded-[calc(2rem-0.5rem)] bg-white p-5 text-right">
          <h3 className="text-sm font-bold text-slate-500 mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-base font-extrabold text-slate-800">إجمالي إلى يد المدير 👤</span>
          </h3>
          <div className="space-y-2 text-base font-semibold">
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="text-slate-400 text-sm font-bold">ريال يمني:</span>
              <span className="text-slate-700 font-extrabold">{formatCurrency(breakdown.Manager_Hand.YER, "YER")}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="text-slate-400 text-sm font-bold">ريال سعودي:</span>
              <span className="text-slate-700 font-extrabold">{formatCurrency(breakdown.Manager_Hand.SAR, "SAR")}</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-slate-400 text-sm font-bold">دولار أمريكي:</span>
              <span className="text-slate-700 font-extrabold">{formatCurrency(breakdown.Manager_Hand.USD, "USD")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
