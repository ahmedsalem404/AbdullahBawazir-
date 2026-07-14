"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Pencil,
  Trash2,
  Droplets,
} from "lucide-react";
import type { Customer } from "@/lib/types";
import { PAGE_SIZE, formatDate, formatCurrency } from "./constants";
import { StatusBadge } from "./ui-elements";

/**
 * @component CustomersGrid
 * @description جدول عرض بيانات العملاء.
 * يعرض قائمة العملاء، ويتيح التحكم بها عبر أزرار عرض الفاتورة، تعديل البيانات، أو الحذف (للمدراء فقط).
 * يدعم تقسيم الصفحات (Pagination).
 */
export function CustomersGrid({
  customers,
  totalRows,
  page,
  isPending,
  isManager,
  onPageChange,
  onEdit,
  onDelete,
  onInvoice,
}: {
  customers: Customer[];
  totalRows: number;
  page: number;
  isPending: boolean;
  isManager: boolean;
  onPageChange: (page: number) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onInvoice: (customer: Customer) => void;
}) {
  const totalPages = Math.max(Math.ceil(totalRows / PAGE_SIZE), 1);

  return (
    <div className="w-full rounded-[2rem] border border-slate-200/40 bg-slate-100/50 p-2 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-550 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.04)]">
      <div className="w-full rounded-[calc(2rem-0.5rem)] bg-white overflow-hidden border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
        
        {/* Desktop Table View */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[880px] border-collapse text-right">
            <thead>
              <tr className="bg-slate-50/80 text-sm text-slate-700 border-b border-slate-100">
                <th className="px-4 py-5 font-bold w-12 text-center">#</th>
                <th className="px-6 py-5 font-bold">اسم العميل</th>
                <th className="px-6 py-5 font-bold">نوع السيارة</th>
                <th className="px-6 py-5 font-bold">سنة الصنع</th>
                <th className="px-6 py-5 font-bold">المهندس المسؤول</th>
                <th className="px-6 py-5 font-bold">المبلغ المطلوب</th>
                <th className="px-6 py-5 font-bold">التاريخ</th>
                <th className="px-6 py-5 font-bold">الحالة</th>
                <th className="px-6 py-5 font-bold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className={isPending ? "opacity-60" : ""}>
              {customers.map((customer, index) => {
                const serialNumber = (page - 1) * PAGE_SIZE + index + 1;
                return (
                  <tr
                    key={customer.id}
                    className="border-b border-slate-100 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-slate-50/50"
                  >
                    <td className="px-4 py-5 font-bold text-slate-400 text-center w-12">
                      {serialNumber}
                    </td>
                    <td className="px-6 py-5 text-base font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <span>{customer.customer_name}</span>
                        {(customer.injectors_amount ?? 0) > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-black text-blue-700" title="يوجد تنظيف بخاخات">
                            <Droplets size={10} className="text-blue-600" />
                            <span>بخاخات</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-base text-slate-600 font-medium">{customer.car_type}</td>
                    <td className="px-6 py-5 text-base font-semibold text-slate-600">{customer.car_year}</td>
                    <td className="px-6 py-5 text-base text-slate-600 font-medium">{customer.engineer_name ?? "غير محدد"}</td>
                    <td className="px-6 py-5 text-base font-extrabold text-slate-800">
                      {!customer.required_amount || customer.required_amount === 0 ? (
                        <span className="text-slate-400 font-bold text-sm italic">لم يتم تحديد السعر</span>
                      ) : (
                        formatCurrency(customer.required_amount, customer.currency)
                      )}
                    </td>
                    <td className="px-6 py-5 text-base font-medium text-slate-500" dir="ltr">
                      {formatDate(customer.created_at)}
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={customer.status} />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-600 border border-slate-200">
                          {customer.payment_method === "Cash" ? "كاش" : customer.payment_method === "Transfer" ? `حوالة - ${customer.transfer_type || ""}` : "يد المدير"}
                        </span>
                        <button
                          onClick={() => onInvoice(customer)}
                          className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-100 px-3 text-sm font-bold text-slate-700 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-slate-200 active:scale-95 cursor-pointer"
                        >
                          <FileText size={17} />
                          عرض الفاتورة
                        </button>
                        <button
                          onClick={() => onEdit(customer)}
                          className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-500 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-blue-50 hover:text-blue-600 active:scale-95 cursor-pointer"
                          aria-label="تعديل العميل"
                        >
                          <Pencil size={18} />
                        </button>
                        {isManager ? (
                          <button
                            onClick={() => onDelete(customer)}
                            className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-brand-red transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-red-100 active:scale-95 cursor-pointer"
                            aria-label="حذف العميل"
                          >
                            <Trash2 size={18} />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="grid gap-4 p-4 md:hidden">
          {customers.map((customer, index) => {
            const serialNumber = (page - 1) * PAGE_SIZE + index + 1;
            return (
              <article
                key={customer.id}
                className="rounded-[2rem] border border-slate-100 bg-slate-50/40 p-1.5 shadow-sm"
              >
                <div className="w-full rounded-[calc(2rem-0.375rem)] bg-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 flex items-center flex-wrap gap-1.5">
                        <span className="text-slate-400 font-extrabold text-base ml-0.5">#{serialNumber}</span>
                        <span>{customer.customer_name}</span>
                        {(customer.injectors_amount ?? 0) > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-black text-blue-700" title="يوجد تنظيف بخاخات">
                            <Droplets size={10} className="text-blue-600" />
                            <span>بخاخات</span>
                          </span>
                        )}
                      </h3>
                      <p className="mt-1 text-sm text-slate-400 font-medium" dir="ltr">
                        {formatDate(customer.created_at)}
                      </p>
                    </div>
                    <StatusBadge status={customer.status} />
                  </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm border-t border-slate-50 pt-4">
                  <dt className="text-slate-400 font-bold">نوع السيارة</dt>
                  <dd className="font-semibold text-slate-700 text-left">{customer.car_type}</dd>
                  <dt className="text-slate-400 font-bold">سنة الصنع</dt>
                  <dd className="font-semibold text-slate-700 text-left">{customer.car_year}</dd>
                  <dt className="text-slate-400 font-bold">المهندس المسؤول</dt>
                  <dd className="font-semibold text-slate-700 text-left">{customer.engineer_name ?? "غير محدد"}</dd>
                  <dt className="text-slate-400 font-bold">المبلغ المطلوب</dt>
                  <dd className="font-extrabold text-slate-800 text-left">
                    {!customer.required_amount || customer.required_amount === 0 ? (
                      <span className="text-slate-400 font-bold text-xs italic">لم يتم تحديد السعر</span>
                    ) : (
                      formatCurrency(customer.required_amount, customer.currency)
                    )}
                  </dd>
                  <dt className="text-slate-400 font-bold">طريقة الدفع</dt>
                  <dd className="text-left">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-extrabold text-slate-600 border border-slate-200">
                      {customer.payment_method === "Cash" ? "كاش" : customer.payment_method === "Transfer" ? `حوالة - ${customer.transfer_type || ""}` : "يد المدير"}
                    </span>
                  </dd>
                </dl>
                <div className="mt-5 flex gap-2 border-t border-slate-50 pt-4">
                  <button
                    onClick={() => onInvoice(customer)}
                    className="h-10 flex-1 rounded-xl bg-slate-100 text-sm font-bold text-slate-700 transition active:scale-95 cursor-pointer"
                  >
                    عرض الفاتورة
                  </button>
                  <button
                    onClick={() => onEdit(customer)}
                    className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-500 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 active:scale-95 cursor-pointer"
                    aria-label="تعديل العميل"
                  >
                    <Pencil size={18} />
                  </button>
                  {isManager ? (
                    <button
                      onClick={() => onDelete(customer)}
                      className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-brand-red active:scale-95 cursor-pointer"
                      aria-label="حذف العميل"
                    >
                      <Trash2 size={18} />
                    </button>
                  ) : null}
                </div>
                </div>
              </article>
            );
          })}
        </div>

        {customers.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm font-bold text-slate-400">
            لا توجد سجلات لهذا اليوم أو البحث المحدد.
          </div>
        ) : null}

        <div className="flex items-center justify-center gap-2 border-t border-slate-100 px-4 py-4 bg-slate-50/30">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700 disabled:opacity-40 transition active:scale-95 cursor-pointer"
            aria-label="الصفحة السابقة"
          >
            <ChevronRight size={18} />
          </button>
          <span className="rounded-xl bg-brand-green px-4 py-2 text-sm font-bold text-white shadow-sm">
            {page}
          </span>
          <span className="px-1 text-sm font-semibold text-slate-400">/</span>
          <span className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
            {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700 disabled:opacity-40 transition active:scale-95 cursor-pointer"
            aria-label="الصفحة التالية"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
