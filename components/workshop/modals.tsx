"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { FileText, Printer, X, Share2 } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import type {
  Customer,
  Engineer,
  CustomerFormValues,
  EngineerFormValues,
  FinancialBreakdown,
} from "@/lib/types";
import {
  WORKSHOP_NAME,
  formatCurrency,
  formatDate,
  emptyForm,
  todayInputValue,
} from "./constants";
import { StatusBadge, TextField, NumberField } from "./ui-elements";

/**
 * @component CustomerModal
 * @description نافذة منبثقة (Modal) لإضافة أو تعديل بيانات العميل.
 * تحتوي على نموذج (Form) لجمع بيانات العميل مثل الاسم، الهاتف، المهندس المسؤول، والمبالغ المالية.
 */
export function CustomerModal({
  engineers,
  initialData,
  onClose,
  onSave,
}: {
  engineers: Engineer[];
  initialData?: Customer;
  onClose: () => void;
  onSave: (values: CustomerFormValues, id?: string) => Promise<void>;
}) {
  const [dropdownEngineers, setDropdownEngineers] = useState<Engineer[]>(() => {
    const currentEngineer = initialData?.engineer;
    const initialList = [...engineers];
    if (currentEngineer && !engineers.some((e) => e.id === currentEngineer.id)) {
      initialList.push(currentEngineer);
    }
    return initialList;
  });

  const [loadingEngineers, setLoadingEngineers] = useState(true);

  const currentEngineer = initialData?.engineer;
  const isOlderThan24Hours = initialData
    ? (Date.now() - new Date(initialData.created_at || initialData.createdAt || "").getTime()) > 24 * 60 * 60 * 1000
    : false;
  const isEngineerDeleted = currentEngineer?.isDeleted || false;
  const disableEngineerSelect = isOlderThan24Hours && isEngineerDeleted;

  const [values, setValues] = useState<CustomerFormValues>(() => {
    if (initialData) {
      return {
        customer_name: initialData.customer_name,
        phone: initialData.phone,
        car_type: initialData.car_type,
        car_year: initialData.car_year,
        engineer_id: initialData.engineer_id ?? dropdownEngineers[0]?.id ?? "",
        work_notes: initialData.work_notes,
        required_amount: initialData.required_amount,
        paid_amount: initialData.paid_amount,
        injectors_amount: initialData.injectors_amount ?? 0,
        currency: initialData.currency ?? "YER",
        payment_method: initialData.payment_method ?? "Cash",
        transfer_type: initialData.transfer_type ?? null,
        is_not_worked_on: initialData.is_not_worked_on ?? false,
      };
    }
    return {
      ...emptyForm,
      engineer_id: dropdownEngineers[0]?.id ?? "",
    };
  });

  useEffect(() => {
    async function fetchAttended() {
      try {
        const dateStr = initialData
          ? new Date(initialData.created_at || initialData.createdAt || "").toISOString().slice(0, 10)
          : todayInputValue();

        const res = await fetch(`/api/engineers?date=${dateStr}`);
        if (res.ok) {
          const attended: Engineer[] = await res.json();

          // Append the original engineer if they are not in the attended list
          const currentEngineer = initialData?.engineer;
          const finalEngineers = [...attended];
          if (currentEngineer && !attended.some((e) => e.id === currentEngineer.id)) {
            finalEngineers.push(currentEngineer);
          }
          setDropdownEngineers(finalEngineers);

          // Update selected engineer_id if it's currently not in the finalEngineers list
          setValues((prev) => {
            if (finalEngineers.length > 0 && !finalEngineers.some(e => e.id === prev.engineer_id)) {
              return { ...prev, engineer_id: finalEngineers[0].id };
            }
            return prev;
          });
        }
      } catch (err) {
        console.error("Failed to load attended engineers", err);
      } finally {
        setLoadingEngineers(false);
      }
    }
    fetchAttended();
  }, [initialData, engineers]);
  const [saving, setSaving] = useState(false);
  const siteRequired = Math.max(values.required_amount - (values.injectors_amount || 0), 0);
  const remaining = Math.max(siteRequired - values.paid_amount, 0);

  const modalStatus = values.is_not_worked_on
    ? "لم يتم العمل"
    : (values.required_amount <= 0 ? "قيد العمل" : (remaining <= 0 ? "مدفوع" : "قيد العمل"));

  function update<K extends keyof CustomerFormValues>(
    key: K,
    value: CustomerFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 px-4 py-6 backdrop-blur-md">
      <style>{`
        @keyframes modalOpen {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-modal-open {
          animation: modalOpen 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
      <div className="w-full max-w-3xl rounded-[2.5rem] border border-slate-200/40 bg-slate-100/50 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-550 ease-[cubic-bezier(0.32,0.72,0,1)] animate-modal-open">
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setSaving(true);
            await onSave(values, initialData?.id);
            setSaving(false);
          }}
          className="max-h-[85vh] w-full overflow-y-auto rounded-[calc(2.5rem-0.5rem)] bg-white p-6 sm:p-8 border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]"
        >
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">
              {initialData ? "تعديل بيانات العميل" : "إضافة عميل جديد"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق"
              className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-90 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              label="اسم العميل"
              value={values.customer_name}
              onChange={(value) => update("customer_name", value)}
              required
            />
            <TextField
              label="رقم الهاتف"
              value={values.phone}
              onChange={(value) => update("phone", value.replace(/[^0-9\-\s]/g, ""))}
              required
              inputProps={{
                inputMode: "tel",
                pattern: "[0-9\\-\\s]*",
                placeholder: "مثال: 777777777-711111111",
              }}
            />
            <TextField
              label="نوع السيارة"
              value={values.car_type}
              onChange={(value) => update("car_type", value)}
              required
              inputProps={{
                placeholder: "اكتب الشركة المصنعة ثم الموديل (مثال: تويوتا كامري، هيونداي سوناتا)",
              }}
            />
            <NumberField
              label="سنة الصنع"
              value={values.car_year}
              onChange={(value) => update("car_year", value)}
              required
            />
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-bold text-slate-700">اسم المهندس المسؤول</span>
              <select
                value={values.engineer_id}
                onChange={(event) => update("engineer_id", event.target.value)}
                disabled={disableEngineerSelect}
                className="h-12 w-full rounded-2xl border border-brand-line bg-white px-4 outline-none transition focus:border-brand-green focus:ring-4 focus:ring-brand-green/12 disabled:bg-slate-50 disabled:text-slate-500 cursor-pointer"
                required
              >
                {dropdownEngineers.map((engineer) => (
                  <option key={engineer.id} value={engineer.id}>
                    {engineer.name} {engineer.isDeleted ? " (محذوف)" : ""}
                  </option>
                ))}
              </select>
            </label>
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-bold text-slate-700">ملاحظات العمل</span>
              <textarea
                value={values.work_notes}
                onChange={(event) => update("work_notes", event.target.value)}
                className="min-h-32 w-full resize-y rounded-2xl border border-brand-line bg-white p-4 outline-none transition focus:border-brand-green focus:ring-4 focus:ring-brand-green/12 text-base"
                required
              />
            </label>
            <NumberField
              label="المبلغ المطلوب"
              value={values.required_amount}
              onChange={(value) => update("required_amount", value)}
              allowDecimals={values.currency !== "YER"}
            />
            <NumberField
              label="مبلغ تنظيف البخاخات"
              value={values.injectors_amount || 0}
              onChange={(value) => update("injectors_amount", value)}
              allowDecimals={values.currency !== "YER"}
            />
            <NumberField
              label="المبلغ المدفوع"
              value={values.paid_amount}
              onChange={(value) => update("paid_amount", value)}
              allowDecimals={values.currency !== "YER"}
            />

            {/* اختيار العملة */}
            <label>
              <span className="mb-2 block text-sm font-bold text-slate-700">العملة 💵</span>
              <select
                value={values.currency}
                onChange={(event) => update("currency", event.target.value as any)}
                className="h-12 w-full rounded-2xl border border-brand-line bg-white px-4 outline-none transition focus:border-brand-green focus:ring-4 focus:ring-brand-green/12 cursor-pointer"
              >
                <option value="SAR">ريال سعودي 🇸🇦</option>
                <option value="YER">ريال يمني 🇾🇪</option>
                <option value="USD">دولار أمريكي 💵</option>
              </select>
            </label>

            {/* طريقة الدفع */}
            <label>
              <span className="mb-2 block text-sm font-bold text-slate-700">طريقة الدفع 💳</span>
              <select
                value={values.payment_method}
                onChange={(event) => {
                  const method = event.target.value as any;
                  update("payment_method", method);
                  if (method !== "Transfer") {
                    update("transfer_type", null);
                  } else {
                    update("transfer_type", "بنك القطيبي");
                  }
                }}
                className="h-12 w-full rounded-2xl border border-brand-line bg-white px-4 outline-none transition focus:border-brand-green focus:ring-4 focus:ring-brand-green/12 cursor-pointer"
              >
                <option value="Cash">كاش 💵</option>
                <option value="Transfer">حوالة 🔄</option>
                <option value="Manager_Hand">إلى يد المدير 👤</option>
              </select>
            </label>

            {/* نوع الحوالة (يظهر فقط إذا تم اختيار حوالة) */}
            {values.payment_method === "Transfer" && (
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700">نوع الحوالة 📱</span>
                <select
                  value={values.transfer_type || "بنك القطيبي"}
                  onChange={(event) => update("transfer_type", event.target.value as any)}
                  className="h-12 w-full rounded-2xl border border-brand-line bg-white px-4 outline-none transition focus:border-brand-green focus:ring-4 focus:ring-brand-green/12 cursor-pointer"
                  required
                >
                  <option value="بنك القطيبي">بنك القطيبي</option>
                  <option value="بنك الكريمي">بنك الكريمي</option>
                  <option value="الشبكة الموحدة">الشبكة الموحدة</option>
                </select>
              </label>
            )}

            {/* Checkbox لم يتم العمل */}
            <div className="md:col-span-2 flex items-center gap-3 py-2 select-none">
              <input
                type="checkbox"
                id="is_not_worked_on"
                checked={values.is_not_worked_on}
                onChange={(event) => update("is_not_worked_on", event.target.checked)}
                className="h-6 w-6 rounded-lg border-brand-line text-brand-green focus:ring-brand-green/12 transition cursor-pointer"
              />
              <label htmlFor="is_not_worked_on" className="text-base font-bold text-slate-700 cursor-pointer">
                لم يتم العمل 🚫 (إذا تم تفعيل هذا الخيار، سيتم تعيين حالة العميل كـ "لم يتم العمل")
              </label>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 md:col-span-2 border border-slate-100">
              <span className="text-sm font-bold text-slate-500">
                الرصيد المتبقي
              </span>
              <div className="mt-2 flex items-center justify-between gap-3">
                <strong className="text-xl text-slate-800 font-extrabold">{formatCurrency(remaining, values.currency)}</strong>
                <StatusBadge status={modalStatus} />
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="h-12 rounded-2xl px-6 text-base font-bold text-slate-600 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-slate-100 active:scale-95 cursor-pointer"
            >
              إلغاء
            </button>
            <button
              disabled={saving}
              type="submit"
              className="h-12 rounded-2xl bg-brand-green px-8 text-base font-bold text-white shadow-card transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-brand-greenDark active:scale-95 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
            >
              {saving ? "جار الحفظ..." : "حفظ العميل"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * @component EngineerModal
 * @description نافذة منبثقة (Modal) لإضافة بيانات مهندس جديد.
 */
export function EngineerModal({
  onClose,
  onSave,
  engineer,
}: {
  onClose: () => void;
  onSave: (values: EngineerFormValues) => Promise<void>;
  engineer?: Engineer | null;
}) {
  const [values, setValues] = useState<EngineerFormValues>({
    name: engineer?.name || "",
    phone: engineer?.phone || "",
    address: engineer?.address || "",
  });
  const [saving, setSaving] = useState(false);

  function update<K extends keyof EngineerFormValues>(
    key: K,
    value: EngineerFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 px-4 py-6 backdrop-blur-md">
      <style>{`
        @keyframes modalOpen {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-modal-open {
          animation: modalOpen 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
      <div className="w-full max-w-lg rounded-[2.5rem] border border-slate-200/40 bg-slate-100/50 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-550 ease-[cubic-bezier(0.32,0.72,0,1)] animate-modal-open">
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setSaving(true);
            await onSave(values);
            setSaving(false);
          }}
          className="w-full rounded-[calc(2.5rem-0.5rem)] bg-white p-6 sm:p-8 border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]"
        >
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 font-bold">
              {engineer ? "تعديل بيانات المهندس" : "إضافة مهندس جديد"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق"
              className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-90 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid gap-5">
            <TextField
              label="اسم المهندس"
              value={values.name}
              onChange={(v) => update("name", v)}
              required
            />
            <TextField
              label="رقم الهاتف"
              value={values.phone || ""}
              onChange={(v) => update("phone", v.replace(/[^0-9]/g, ""))}
              required
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
              }}
            />
            <TextField
              label="مكان السكن"
              value={values.address || ""}
              onChange={(v) => update("address", v)}
              required
            />
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="h-12 rounded-2xl px-6 text-base font-bold text-slate-600 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-slate-100 active:scale-95 cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-12 rounded-2xl bg-brand-green px-8 text-base font-bold text-white shadow-card transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-brand-greenDark active:scale-95 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
            >
              {saving ? "جار الحفظ..." : "حفظ المهندس"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * @component InvoiceModal
 * @description نافذة منبثقة (Modal) لعرض فاتورة العميل وتصميمها مخصص للطباعة A4.
 */
export function InvoiceModal({
  customer,
  onClose,
}: {
  customer: Customer;
  onClose: () => void;
}) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareFile, setShareFile] = useState<File | null>(null);

  async function sharePdf() {
    if (shareFile) {
      try {
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [shareFile] })) {
          await navigator.share({
            files: [shareFile],
            title: "فاتورة صيانة",
            text: `مرفق فاتورة الصيانة الخاصة بالعميل ${customer.customer_name} من مركز عبدالله باوزير.`,
          });
          setShareFile(null);
        }
      } catch (err) {
        console.error("Failed to share prepared file:", err);
      }
      return;
    }

    if (!invoiceRef.current) return;
    setIsSharing(true);

    try {
      const image = await toPng(invoiceRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(image);
      const imageHeight = (imgProps.height * pageWidth) / imgProps.width;

      pdf.addImage(image, "PNG", 0, 0, pageWidth, imageHeight);
      const pdfBlob = pdf.output("blob");
      const file = new File([pdfBlob], `invoice-${customer.customer_name}.pdf`, { type: "application/pdf" });
      setShareFile(file);

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "فاتورة صيانة",
            text: `مرفق فاتورة الصيانة الخاصة بالعميل ${customer.customer_name} من مركز عبدالله باوزير.`,
          });
          setShareFile(null);
        } catch (shareErr: any) {
          console.warn("Direct share blocked, waiting for second click gesture:", shareErr);
        }
      } else {
        pdf.save(`invoice-${customer.customer_name}.pdf`);
      }
    } catch (err) {
      console.error("Failed to share PDF", err);
    } finally {
      setIsSharing(false);
    }
  }

  async function exportPdf() {
    if (!invoiceRef.current) return;
    setIsExporting(true);

    try {
      const image = await toPng(invoiceRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(image);
      const imageHeight = (imgProps.height * pageWidth) / imgProps.width;

      pdf.addImage(image, "PNG", 0, 0, pageWidth, imageHeight);
      pdf.save(`invoice-${customer.customer_name}.pdf`);
    } catch (err) {
      console.error("Failed to export PDF", err);
    } finally {
      setIsExporting(false);
    }
  }

  function printInvoice() {
    window.print();
  }

  const branchAddress = customer.branch === "الدرين"
    ? "فرع الدرين (الدرين مقابل محطة باهدى)"
    : "فرع الحسوة (الحسوة محطة ومجمع بتر بارك)";

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 px-4 py-6 backdrop-blur-md cursor-pointer"
    >
      <style>{`
        @keyframes modalOpen {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-modal-open {
          animation: modalOpen 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @media print {
          @page {
            size: A4;
            margin: 1.5cm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background-color: white !important;
          }
          #printable-invoice {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
      <div className="w-full max-w-4xl max-w-full rounded-[2.5rem] border border-slate-200/40 bg-slate-100/50 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-550 ease-[cubic-bezier(0.32,0.72,0,1)] animate-modal-open cursor-default">
        <div className="max-h-[85vh] w-full max-w-full overflow-y-auto overflow-x-hidden rounded-[calc(2.5rem-0.5rem)] bg-white p-5 sm:p-8 border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
          <div className="no-print sticky top-0 z-20 bg-white mb-6 flex items-center justify-between border-b border-slate-100 pb-4 pt-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">معاينة الفاتورة</h2>
            <button
              onClick={onClose}
              aria-label="إغلاق"
              className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-90 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Printable Area */}
          <div className="w-full overflow-x-auto scrollbar-thin">
            <div
              id="printable-invoice"
              ref={invoiceRef}
              className="mx-auto w-[794px] bg-white p-12 text-slate-800 flex-shrink-0"
              dir="rtl"
            >
            <header className="mb-6 print:mb-8 flex items-center justify-between border-b-2 border-brand-green pb-6 print:pb-6">
              <div className="flex items-center gap-4">
                <Image
                  src="/bawazir-logo.png"
                  alt={WORKSHOP_NAME}
                  width={112}
                  height={112}
                  className="h-28 w-28 sm:h-32 sm:w-32 print:h-36 print:w-36 object-contain"
                />
                <div>
                  <h1 className="text-2xl sm:text-3xl print:text-3xl font-extrabold text-slate-800 tracking-tight">{WORKSHOP_NAME}</h1>
                  <p className="mt-1 text-base sm:text-lg print:text-base font-medium text-slate-500">
                    فاتورة صيانة شاملة للسيارات
                  </p>
                </div>
              </div>
              <div className="text-left text-base sm:text-lg print:text-sm text-slate-600 font-bold space-y-2 print:space-y-1">
                <p>الفرع: <span className="font-extrabold text-slate-800">{customer.branch || "الحسوة"}</span></p>
                <p>الهاتف: <span className="font-extrabold text-slate-800">770533333</span></p>
                <p>التاريخ: <span dir="ltr" className="font-extrabold text-slate-800">{formatDate(customer.created_at)}</span></p>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-6 mb-8 print:mb-6">
              <div className="rounded-2xl bg-slate-50 p-5 print:p-5 border border-slate-100">
                <h3 className="mb-4 print:mb-3 text-base sm:text-lg print:text-base font-bold text-slate-700 border-b border-slate-200 pb-2 print:pb-2">بيانات العميل والمركبة</h3>
                <dl className="grid gap-y-3 print:gap-y-2 text-base print:text-sm">
                  <div className="flex justify-between"><dt className="text-slate-500 font-bold">اسم العميل:</dt><dd className="font-bold text-slate-850">{customer.customer_name}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-500 font-bold">رقم الهاتف:</dt><dd className="font-bold text-slate-850" dir="ltr">{customer.phone}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-500 font-bold">نوع السيارة:</dt><dd className="font-bold text-slate-850">{customer.car_type}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-500 font-bold">سنة الصنع:</dt><dd className="font-bold text-slate-850">{customer.car_year}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-500 font-bold">المهندس المسؤول:</dt><dd className="font-bold text-slate-850">{customer.engineer_name ?? "غير محدد"}</dd></div>
                </dl>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5 print:p-5 border border-slate-100">
                <h3 className="mb-4 print:mb-3 text-base sm:text-lg print:text-base font-bold text-slate-700 border-b border-slate-200 pb-2 print:pb-2">الملخص المالي</h3>
                <dl className="grid gap-y-3 print:gap-y-2 text-base print:text-sm">
                  <div className="flex justify-between"><dt className="text-slate-500 font-bold">المبلغ المدفوع:</dt><dd className="font-extrabold text-brand-green text-lg print:text-lg">{formatCurrency(customer.paid_amount, customer.currency)}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-500 font-bold">عملة الدفع:</dt><dd className="font-bold text-slate-850">{customer.currency === "SAR" ? "ريال سعودي 🇸🇦" : customer.currency === "YER" ? "ريال يمني 🇾🇪" : "دولار أمريكي 💵"}</dd></div>
                  {customer.payment_method !== "Manager_Hand" && (
                    <div className="flex justify-between">
                      <dt className="text-slate-500 font-bold">طريقة الدفع:</dt>
                      <dd className="font-bold text-slate-850">
                        {customer.payment_method === "Cash" ? "كاش" : `حوالة (${customer.transfer_type || ""})`}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            <section className="rounded-2xl border border-slate-200 p-6 print:p-5 mb-6 print:mb-6">
              <h3 className="mb-3 print:mb-2 text-base sm:text-lg print:text-base font-bold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-2 print:pb-2">
                <span>ملاحظات العمل المنجز</span>
                <StatusBadge status={customer.status} />
              </h3>
              <p className="min-h-32 print:min-h-24 print:text-sm whitespace-pre-wrap text-base print:leading-relaxed leading-relaxed text-slate-700">
                {customer.work_notes}
              </p>
            </section>

            <footer className="mt-12 print:mt-8 pt-6 print:pt-4 border-t border-slate-200 text-center text-base sm:text-lg print:text-sm font-bold text-slate-500 space-y-2 print:space-y-1">
              <p className="font-extrabold text-slate-700">{branchAddress}</p>
              <p className="text-lg sm:text-xl print:text-base font-extrabold text-slate-850">شكراً لثقتكم بمركز عبدالله باوزير لصيانة السيارات.</p>
              <p className="text-xs sm:text-sm print:text-xs text-slate-400 font-bold mt-1">هذه الفاتورة آلية ولا تحتاج إلى ختم أو توقيع</p>
            </footer>
          </div>
        </div>

          {/* Action Buttons */}
          <div className="no-print mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={printInvoice}
              className="flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-base font-bold text-white shadow-card transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-blue-700 active:scale-95 cursor-pointer"
            >
              <Printer size={20} />
              طباعة الفاتورة
            </button>
            <button
              disabled={isExporting}
              onClick={exportPdf}
              className="flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand-green px-6 text-base font-bold text-white shadow-card transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-brand-greenDark active:scale-95 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
            >
              <FileText size={20} />
              {isExporting ? "جار تجهيز PDF..." : "تنزيل الفاتورة PDF"}
            </button>
            <button
              disabled={isSharing}
              onClick={sharePdf}
              className={`flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-6 text-base font-bold text-white shadow-card transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95 disabled:opacity-60 disabled:pointer-events-none cursor-pointer ${
                shareFile
                  ? "bg-emerald-600 hover:bg-emerald-700 animate-pulse"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              <Share2 size={20} />
              {isSharing
                ? "جاري تجهيز الملف..."
                : shareFile
                  ? "إرسال الملف الآن 📤"
                  : "مشاركة الفاتورة"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * @component ConfirmModal
 * @description نافذة منبثقة للتأكيد (Confirmation Modal).
 * تستخدم لتأكيد عمليات الحذف وتجنب الأخطاء غير المقصودة.
 */
export function ConfirmModal({
  title,
  body,
  onCancel,
  onConfirm,
  confirmLabel = "حذف",
  confirmBtnColor = "bg-brand-red hover:bg-red-700",
}: {
  title: string;
  body: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  confirmBtnColor?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 px-4 backdrop-blur-md">
      <style>{`
        @keyframes modalOpen {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-modal-open {
          animation: modalOpen 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200/40 bg-slate-100/50 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-550 ease-[cubic-bezier(0.32,0.72,0,1)] animate-modal-open">
        <div className="rounded-[calc(2rem-0.375rem)] bg-white p-6 sm:p-7 border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <p className="mt-3 leading-7 text-slate-650 font-medium">{body}</p>
          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              onClick={onCancel}
              className="h-12 rounded-2xl px-6 text-base font-bold text-slate-600 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-slate-100 active:scale-95 cursor-pointer"
            >
              إلغاء
            </button>
            <button
              onClick={onConfirm}
              className={`h-12 rounded-2xl px-6 text-base font-bold text-white shadow-card transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95 cursor-pointer ${confirmBtnColor}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * @component DailyReportModal
 * @description نافذة منبثقة (Modal) لمعاينة وطباعة التقرير اليومي بصيغة A4.
 */
export function DailyReportModal({
  onClose,
  dateFilter,
  fetchCustomers,
  financialBreakdown,
  branch,
}: {
  onClose: () => void;
  dateFilter: string;
  fetchCustomers: () => Promise<Customer[]>;
  financialBreakdown: FinancialBreakdown;
  branch?: string;
}) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    fetchCustomers().then((data) => {
      setCustomers(data);
      setLoading(false);
    });
  }, [fetchCustomers]);

  async function exportPdf() {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const image = await toPng(reportRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(image);
      const imageHeight = (imgProps.height * pageWidth) / imgProps.width;

      pdf.addImage(image, "PNG", 0, 0, pageWidth, imageHeight);
      pdf.save(`daily-report-${dateFilter}.pdf`);
    } catch (err) {
      console.error("Failed to export PDF", err);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 px-4 py-6 backdrop-blur-md">
      <style>{`
        @keyframes modalOpen {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-modal-open {
          animation: modalOpen 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
      <div className="w-full max-w-5xl rounded-[2.5rem] border border-slate-200/40 bg-slate-100/50 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-550 ease-[cubic-bezier(0.32,0.72,0,1)] animate-modal-open">
        <div className="max-h-[85vh] w-full overflow-y-auto rounded-[calc(2.5rem-0.5rem)] bg-white p-5 sm:p-8 border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
          <div className="no-print mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">معاينة التقرير اليومي A4</h2>
            <button
              onClick={onClose}
              aria-label="إغلاق"
              className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-90 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {loading ? (
            <div className="flex h-60 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
            </div>
          ) : (
            <>
              {/* A4 Report Area */}
              <div
                id="printable-daily-report"
                ref={reportRef}
                className="mx-auto w-full bg-white p-12 sm:p-16 print:p-4 text-slate-800"
                dir="rtl"
              >
                <header className="mb-6 flex items-center justify-between border-b-2 border-slate-800 pb-4">
                  <div className="flex items-center gap-4">
                    <Image
                      src="/bawazir-logo.png"
                      alt={WORKSHOP_NAME}
                      width={112}
                      height={112}
                      className="h-28 w-28 sm:h-32 sm:w-32 object-contain"
                    />
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">{WORKSHOP_NAME}</h1>
                      <p className="mt-1 text-base sm:text-lg font-medium text-slate-500">تقرير المبيعات والعمليات اليومي</p>
                    </div>
                  </div>
                  <div className="text-left text-base sm:text-lg text-slate-600 font-bold space-y-2">
                    <p>الفرع: <span className="font-extrabold text-slate-800">{branch || "الحسوة"}</span></p>
                    <p>التاريخ: <span className="font-extrabold text-slate-800">{dateFilter}</span></p>
                    <p>عدد السيارات: <span className="font-extrabold text-slate-800">{customers.length}</span></p>
                  </div>
                </header>

                <table className="w-full border-collapse text-right text-xs sm:text-sm mb-8 border border-slate-250">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-250">
                      <th className="px-3 py-3 border-l border-slate-250 text-center w-8">#</th>
                      <th className="px-3 py-3 border-l border-slate-250">اسم العميل</th>
                      <th className="px-3 py-3 border-l border-slate-250">نوع السيارة</th>
                      <th className="px-3 py-3 border-l border-slate-250 text-center w-14">السنة</th>
                      <th className="px-3 py-3 border-l border-slate-250">المهندس المسؤول</th>
                      <th className="px-3 py-3 border-l border-slate-250">المبلغ المطلوب</th>
                      <th className="px-3 py-3 border-l border-slate-250">التاريخ</th>
                      <th className="px-3 py-3 text-center">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c, i) => (
                      <tr key={c.id} className="border-b border-slate-200 hover:bg-slate-50/50">
                        <td className="px-3 py-2.5 border-l border-slate-200 text-center font-bold text-slate-400">{i + 1}</td>
                        <td className="px-3 py-2.5 border-l border-slate-200 font-bold text-slate-800">{c.customer_name}</td>
                        <td className="px-3 py-2.5 border-l border-slate-200 font-semibold text-slate-700">{c.car_type}</td>
                        <td className="px-3 py-2.5 border-l border-slate-200 text-center font-medium text-slate-650">{c.car_year}</td>
                        <td className="px-3 py-2.5 border-l border-slate-200 font-medium text-slate-650">{c.engineer_name ?? "غير محدد"}</td>
                        <td className="px-3 py-2.5 border-l border-slate-200 font-bold text-slate-850">
                          {formatCurrency(c.required_amount, c.currency)}
                        </td>
                        <td className="px-3 py-2.5 border-l border-slate-200 font-medium text-slate-500" dir="ltr">
                          {formatDate(c.created_at)}
                        </td>
                        <td className="px-3 py-2.5 text-center font-bold">
                          <span className={`inline-block rounded px-2 py-1 text-xs ${c.status === "مدفوع"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : c.status === "لم يتم العمل"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "bg-orange-50 text-orange-700 border border-orange-200"
                            }`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Financial breakdown of the day */}
                <div className="rounded-2xl border bg-slate-50/50 p-5 mt-6 border-slate-200">
                  <h3 className="mb-4 text-base font-extrabold text-slate-800 border-b border-slate-350 pb-2">
                    إجمالي إيرادات الفرع لليوم 📊
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Cash */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <span className="text-xs font-bold text-slate-400">إجمالي الكاش 💵</span>
                      <div className="mt-2 space-y-1.5">
                        <p className="text-sm font-extrabold text-slate-800">
                          🇸🇦 {formatCurrency(financialBreakdown.Cash.SAR, "SAR")}
                        </p>
                        <p className="text-sm font-extrabold text-slate-800">
                          🇾🇪 {formatCurrency(financialBreakdown.Cash.YER, "YER")}
                        </p>
                        <p className="text-sm font-extrabold text-slate-800">
                          💵 {formatCurrency(financialBreakdown.Cash.USD, "USD")}
                        </p>
                      </div>
                    </div>

                    {/* Transfers */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <span className="text-xs font-bold text-slate-400">إجمالي الحوالات 🔄</span>
                      <div className="mt-2 space-y-1.5">
                        <p className="text-sm font-extrabold text-slate-800">
                          🇸🇦 {formatCurrency(financialBreakdown.Transfer.SAR, "SAR")}
                        </p>
                        <p className="text-sm font-extrabold text-slate-800">
                          🇾🇪 {formatCurrency(financialBreakdown.Transfer.YER, "YER")}
                        </p>
                        <p className="text-sm font-extrabold text-slate-800">
                          💵 {formatCurrency(financialBreakdown.Transfer.USD, "USD")}
                        </p>
                      </div>
                    </div>

                    {/* Manager Hand */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <span className="text-xs font-bold text-slate-400">إجمالي يد المدير 👤</span>
                      <div className="mt-2 space-y-1.5">
                        <p className="text-sm font-extrabold text-slate-800">
                          🇸🇦 {formatCurrency(financialBreakdown.Manager_Hand.SAR, "SAR")}
                        </p>
                        <p className="text-sm font-extrabold text-slate-800">
                          🇾🇪 {formatCurrency(financialBreakdown.Manager_Hand.YER, "YER")}
                        </p>
                        <p className="text-sm font-extrabold text-slate-800">
                          💵 {formatCurrency(financialBreakdown.Manager_Hand.USD, "USD")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <footer className="mt-12 pt-6 border-t border-slate-200 text-center text-base sm:text-lg font-bold text-slate-500">
                  <p>تم استخراج هذا التقرير آلياً من نظام إدارة مركز عبدالله باوزير لصيانة السيارات.</p>
                </footer>
              </div>

              {/* Action Buttons */}
              <div className="no-print mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => window.print()}
                  className="flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-base font-bold text-white shadow-card transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-blue-700 active:scale-95 cursor-pointer"
                >
                  <Printer size={20} />
                  طباعة التقرير
                </button>
                <button
                  disabled={isExporting}
                  onClick={exportPdf}
                  className="flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand-green px-6 text-base font-bold text-white shadow-card transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-brand-greenDark active:scale-95 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
                >
                  <FileText size={20} />
                  {isExporting ? "جار التصدير PDF..." : "تنزيل PDF"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * @component MonthlyReportModal
 * @description نافذة منبثقة (Modal) لاختيار الشهر وجلب إجماليات الإيرادات الشهرية وطباعتها بصيغة A4.
 */
export function MonthlyReportModal({
  onClose,
  onLoadReport,
  reportData,
  loading,
  branch,
}: {
  onClose: () => void;
  onLoadReport: (year: number, month: number) => Promise<void>;
  reportData: FinancialBreakdown | null;
  loading: boolean;
  branch?: string;
}) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${d.getFullYear()}-${m}`;
  });
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (selectedMonth) {
      const [year, month] = selectedMonth.split("-").map(Number);
      onLoadReport(year, month);
    }
  }, [selectedMonth, onLoadReport]);

  async function exportPdf() {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const image = await toPng(reportRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(image);
      const imageHeight = (imgProps.height * pageWidth) / imgProps.width;

      pdf.addImage(image, "PNG", 0, 0, pageWidth, imageHeight);
      pdf.save(`monthly-report-${selectedMonth}.pdf`);
    } catch (err) {
      console.error("Failed to export PDF", err);
    } finally {
      setIsExporting(false);
    }
  }

  const getArabicMonthName = (monthString: string) => {
    if (!monthString) return "";
    const [year, month] = monthString.split("-").map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString("ar-EG", { year: "numeric", month: "long" });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 px-4 py-6 backdrop-blur-md">
      <style>{`
        @keyframes modalOpen {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-modal-open {
          animation: modalOpen 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
      <div className="w-full max-w-3xl rounded-[2.5rem] border border-slate-200/40 bg-slate-100/50 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-550 ease-[cubic-bezier(0.32,0.72,0,1)] animate-modal-open">
        <div className="max-h-[85vh] w-full overflow-y-auto rounded-[calc(2.5rem-0.5rem)] bg-white p-5 sm:p-8 border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
          <div className="no-print mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">معاينة التقرير الشهري A4</h2>
            <button
              onClick={onClose}
              aria-label="إغلاق"
              className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-90 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="no-print mb-6 rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <label className="flex flex-col sm:flex-row sm:items-center gap-4">
              <span className="text-base font-extrabold text-slate-700 shrink-0">اختر الشهر والسنـة 📅</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="h-12 w-full sm:w-60 rounded-xl border border-slate-200 px-4 outline-none font-bold text-slate-700 transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 cursor-pointer"
              />
            </label>
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Monthly Report A4 Page */}
              <div
                id="printable-monthly-report"
                ref={reportRef}
                className="mx-auto w-full bg-white p-12 sm:p-16 print:p-4 text-slate-800"
                dir="rtl"
              >
                <header className="mb-6 flex items-center justify-between border-b-2 border-slate-800 pb-4">
                  <div className="flex items-center gap-4">
                    <Image
                      src="/bawazir-logo.png"
                      alt={WORKSHOP_NAME}
                      width={112}
                      height={112}
                      className="h-28 w-28 sm:h-32 sm:w-32 object-contain"
                    />
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">{WORKSHOP_NAME}</h1>
                      <p className="mt-1 text-base sm:text-lg font-medium text-slate-500">تقرير الإيرادات والأرباح الشهري</p>
                    </div>
                  </div>
                  <div className="text-left text-base sm:text-lg text-slate-600 font-bold space-y-2">
                    <p>الفرع: <span className="font-extrabold text-slate-800">{branch || "الحسوة"}</span></p>
                    <p>الشهر المحدد: <span className="font-extrabold text-slate-800">{getArabicMonthName(selectedMonth)}</span></p>
                  </div>
                </header>

                <div className="mt-8">
                  <h3 className="mb-6 text-center text-base sm:text-lg font-extrabold text-slate-800 bg-slate-50 py-3 rounded-xl border border-slate-150">
                    ملخص الدخل الإجمالي لشهر {getArabicMonthName(selectedMonth)} 📊
                  </h3>

                  {reportData ? (
                    <div className="space-y-6">
                      {/* Cash */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h4 className="text-base font-extrabold text-slate-700 mb-4 flex items-center gap-2">
                          <span className="text-xl font-normal">💵</span> إجمالي الكاش المقبوض للشهر:
                        </h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                            <span className="block text-xs font-bold text-slate-400 mb-1">ريال سعودي</span>
                            <strong className="text-sm sm:text-base font-extrabold text-slate-800">{formatCurrency(reportData.Cash.SAR, "SAR")}</strong>
                          </div>
                          <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                            <span className="block text-xs font-bold text-slate-400 mb-1">ريال يمني</span>
                            <strong className="text-sm sm:text-base font-extrabold text-slate-800">{formatCurrency(reportData.Cash.YER, "YER")}</strong>
                          </div>
                          <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                            <span className="block text-xs font-bold text-slate-400 mb-1">دولار أمريكي</span>
                            <strong className="text-sm sm:text-base font-extrabold text-slate-800">{formatCurrency(reportData.Cash.USD, "USD")}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Transfer */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h4 className="text-base font-extrabold text-slate-700 mb-4 flex items-center gap-2">
                          <span className="text-xl font-normal">🔄</span> إجمالي الحوالات المودعة للشهر:
                        </h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                            <span className="block text-xs font-bold text-slate-400 mb-1">ريال سعودي</span>
                            <strong className="text-sm sm:text-base font-extrabold text-slate-800">{formatCurrency(reportData.Transfer.SAR, "SAR")}</strong>
                          </div>
                          <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                            <span className="block text-xs font-bold text-slate-400 mb-1">ريال يمني</span>
                            <strong className="text-sm sm:text-base font-extrabold text-slate-800">{formatCurrency(reportData.Transfer.YER, "YER")}</strong>
                          </div>
                          <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                            <span className="block text-xs font-bold text-slate-400 mb-1">دولار أمريكي</span>
                            <strong className="text-sm sm:text-base font-extrabold text-slate-800">{formatCurrency(reportData.Transfer.USD, "USD")}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Manager Hand */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h4 className="text-base font-extrabold text-slate-700 mb-4 flex items-center gap-2">
                          <span className="text-xl font-normal">👤</span> إجمالي المبالغ ليد المدير للشهر:
                        </h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                            <span className="block text-xs font-bold text-slate-400 mb-1">ريال سعودي</span>
                            <strong className="text-sm sm:text-base font-extrabold text-slate-800">{formatCurrency(reportData.Manager_Hand.SAR, "SAR")}</strong>
                          </div>
                          <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                            <span className="block text-xs font-bold text-slate-400 mb-1">ريال يمني</span>
                            <strong className="text-sm sm:text-base font-extrabold text-slate-800">{formatCurrency(reportData.Manager_Hand.YER, "YER")}</strong>
                          </div>
                          <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                            <span className="block text-xs font-bold text-slate-400 mb-1">دولار أمريكي</span>
                            <strong className="text-sm sm:text-base font-extrabold text-slate-800">{formatCurrency(reportData.Manager_Hand.USD, "USD")}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                <footer className="mt-12 pt-6 border-t border-slate-200 text-center text-base sm:text-lg font-bold text-slate-500">
                  <p>تم استخراج هذا التقرير آلياً من نظام إدارة مركز عبدالله باوزير لصيانة السيارات.</p>
                </footer>
              </div>

              {/* Action Buttons */}
              <div className="no-print mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => window.print()}
                  className="flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-base font-bold text-white shadow-card transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-blue-700 active:scale-95 cursor-pointer"
                >
                  <Printer size={20} />
                  طباعة التقرير
                </button>
                <button
                  disabled={isExporting}
                  onClick={exportPdf}
                  className="flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand-green px-6 text-base font-bold text-white shadow-card transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-brand-greenDark active:scale-95 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
                >
                  <FileText size={20} />
                  {isExporting ? "جار التصدير PDF..." : "تنزيل PDF"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

