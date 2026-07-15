"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { FileText, Printer, X, Share2 } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import type { Company, CompanyCar, CompanyInvoice } from "@/types/workshop";
import { WORKSHOP_NAME, formatCurrency, formatDate } from "./constants";

interface CompanyInvoiceModalProps {
  invoice: CompanyInvoice;
  company: Company;
  car: CompanyCar;
  onClose: () => void;
}

/**
 * @component CompanyInvoiceModal
 * @description نافذة منبثقة لمعاينة وطباعة فاتورة صيانة سيارة الشركة المتعاقدة (B2B).
 * مصممة لتكون متطابقة بالكامل مع فواتير العملاء العاديين وتدعم الطباعة والـ PDF الفوري.
 */
export function CompanyInvoiceModal({
  invoice,
  company,
  car,
  onClose,
}: CompanyInvoiceModalProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareFile, setShareFile] = useState<File | null>(null);

  // مشاركة الفاتورة عبر الـ Web Share API
  async function sharePdf() {
    if (shareFile) {
      try {
        const filename = `Company-Invoice-${company.name}-${car.name}-${invoice.id.slice(0, 8)}.pdf`;
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [shareFile] })) {
          await navigator.share({
            files: [shareFile],
            title: "فاتورة صيانة شركة",
            text: `مرفق فاتورة الصيانة الخاصة بسيارة الشركة المتعاقدة ${company.name} - ${car.name} من مركز عبدالله باوزير.`,
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
      const filename = `Company-Invoice-${company.name}-${car.name}-${invoice.id.slice(0, 8)}.pdf`;
      const file = new File([pdfBlob], filename, { type: "application/pdf" });
      setShareFile(file);

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "فاتورة صيانة شركة",
            text: `مرفق فاتورة الصيانة الخاصة بسيارة الشركة المتعاقدة ${company.name} - ${car.name} من مركز عبدالله باوزير.`,
          });
          setShareFile(null);
        } catch (shareErr: any) {
          console.warn("Direct share blocked, waiting for second click gesture:", shareErr);
        }
      } else {
        pdf.save(filename);
        setShareFile(null);
      }
    } catch (err) {
      console.error("Failed to share PDF", err);
    } finally {
      setIsSharing(false);
    }
  }

  // تصدير الفاتورة كملف PDF بجودة عالية
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
      pdf.save(`Company-Invoice-${company.name}-${car.name}-${invoice.id.slice(0, 8)}.pdf`);
    } catch (err) {
      console.error("Failed to export PDF", err);
    } finally {
      setIsExporting(false);
    }
  }

  // تفعيل الطباعة الفورية للمتصفح
  function printInvoice() {
    window.print();
  }

  const branchAddress = invoice.branch === "الدرين"
    ? "فرع الدرين (الدرين مقابل محطة باهدى)"
    : "فرع الحسوة (الحسوة محطة ومجمع بتر بارك)";

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
          #printable-company-invoice {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
      <div className="w-full max-w-4xl rounded-[2.5rem] border border-slate-200/40 bg-slate-100/50 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-550 ease-[cubic-bezier(0.32,0.72,0,1)] animate-modal-open">
        <div className="max-h-[85vh] w-full overflow-y-auto rounded-[calc(2.5rem-0.5rem)] bg-white p-5 sm:p-8 border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
          
          {/* Header */}
          <div className="no-print mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">معاينة فاتورة الشركة</h2>
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
              id="printable-company-invoice"
              ref={invoiceRef}
              className="mx-auto w-[794px] bg-white p-12 text-slate-800 flex-shrink-0"
              dir="rtl"
            >
            {/* Header Layout */}
            <header className="mb-6 print:mb-8 flex items-center justify-between border-b-2 border-brand-green pb-6 print:pb-6">
              <div className="flex items-center gap-4">
                <Image
                  src="/bawazir-logo.png"
                  alt={WORKSHOP_NAME}
                  width={112}
                  height={112}
                  className="h-28 w-28 sm:h-32 sm:w-32 print:h-36 print:w-36 object-contain"
                  priority
                />
                <div>
                  <h1 className="text-2xl sm:text-3xl print:text-3xl font-extrabold text-slate-800 tracking-tight">{WORKSHOP_NAME}</h1>
                  <p className="mt-1 text-base sm:text-lg print:text-base font-medium text-slate-500">
                    فاتورة صيانة الشركات المتعاقدة
                  </p>
                </div>
              </div>
              <div className="text-left text-base sm:text-lg print:text-sm text-slate-600 font-bold space-y-2 print:space-y-1">
                <p>الفرع: <span className="font-extrabold text-slate-800">{invoice.branch || "الحسوة"}</span></p>
                <p>الهاتف: <span className="font-extrabold text-slate-800">770533333</span></p>
                <p>التاريخ: <span dir="ltr" className="font-extrabold text-slate-800">{formatDate(invoice.created_at)}</span></p>
              </div>
            </header>

            {/* Bill Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-6 mb-8 print:mb-6">
              {/* Company & Vehicle Info */}
              <div className="rounded-2xl bg-slate-50 p-5 print:p-5 border border-slate-100">
                <h3 className="mb-4 print:mb-3 text-base sm:text-lg print:text-base font-bold text-slate-700 border-b border-slate-200 pb-2 print:pb-2">بيانات الشركة والمركبة</h3>
                <dl className="grid gap-y-3 print:gap-y-2 text-base print:text-sm">
                  <div className="flex justify-between"><dt className="text-slate-500 font-bold">اسم الشركة:</dt><dd className="font-bold text-slate-850">{company.name}</dd></div>
                  {company.contact_number && (
                    <div className="flex justify-between"><dt className="text-slate-500 font-bold">رقم التواصل:</dt><dd className="font-bold text-slate-850" dir="ltr">{company.contact_number}</dd></div>
                  )}
                  <div className="flex justify-between"><dt className="text-slate-500 font-bold">نوع السيارة:</dt><dd className="font-bold text-slate-850">{car.name}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-500 font-bold">سنة الصنع:</dt><dd className="font-bold text-slate-850">{car.year}</dd></div>
                  {car.color && (
                    <div className="flex justify-between"><dt className="text-slate-500 font-bold">اللون:</dt><dd className="font-bold text-slate-850">{car.color}</dd></div>
                  )}
                  <div className="flex justify-between"><dt className="text-slate-500 font-bold">رقم اللوحة / الشاصيه:</dt><dd className="font-bold text-slate-850" dir="ltr">{car.plate_or_chassis}</dd></div>
                </dl>
              </div>

              {/* Financial Summary */}
              <div className="rounded-2xl bg-slate-50 p-5 print:p-5 border border-slate-100 flex flex-col justify-between">
                <div>
                  <h3 className="mb-4 print:mb-3 text-base sm:text-lg print:text-base font-bold text-slate-700 border-b border-slate-200 pb-2 print:pb-2">الملخص المالي</h3>
                  <dl className="grid gap-y-3 print:gap-y-2 text-base print:text-sm">
                    <div className="flex justify-between"><dt className="text-slate-500 font-bold">تكلفة قطع الغيار:</dt><dd className="font-bold text-slate-800">{formatCurrency(invoice.parts_total, invoice.currency)}</dd></div>
                    <div className="flex justify-between"><dt className="text-slate-500 font-bold">تكلفة أجور اليد:</dt><dd className="font-bold text-slate-800">{formatCurrency(invoice.labor_total, invoice.currency)}</dd></div>
                    <div className="flex justify-between"><dt className="text-slate-500 font-bold">عملة الدفع:</dt><dd className="font-bold text-slate-850">{invoice.currency === "SAR" ? "ريال سعودي 🇸🇦" : invoice.currency === "YER" ? "ريال يمني 🇾🇪" : "دولار أمريكي 💵"}</dd></div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 print:pt-2"><dt className="text-slate-500 font-black text-slate-800">المجموع الكلي:</dt><dd className="font-black text-brand-green text-xl print:text-lg">{formatCurrency(invoice.grand_total, invoice.currency)}</dd></div>
                  </dl>
                </div>
                <div className="mt-4 print:mt-4 border-t border-slate-150 pt-2 print:pt-2 text-xs text-slate-400 font-bold flex justify-between">
                  <span>حالة الفاتورة (المحاسبة):</span>
                  <span className={`font-extrabold ${invoice.is_accounted ? "text-emerald-600" : "text-amber-600"}`}>
                    {invoice.is_accounted ? "تمت المحاسبة ✅" : "قيد المراجعة ⏳"}
                  </span>
                </div>
              </div>
            </div>

            {/* Work & Parts Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-6 mb-8 print:mb-6">
              <section className="rounded-2xl border border-slate-200 p-6 print:p-5 flex flex-col">
                <h3 className="mb-3 print:mb-2 text-base sm:text-lg print:text-base font-bold text-slate-800 border-b border-slate-100 pb-2 print:pb-2">
                  تفاصيل العمل المنجز
                </h3>
                <p className="min-h-24 print:min-h-24 print:text-sm whitespace-pre-wrap text-sm print:leading-relaxed leading-relaxed text-slate-700">
                  {invoice.work_details}
                </p>
              </section>

              <section className="rounded-2xl border border-slate-200 p-6 print:p-5 flex flex-col">
                <h3 className="mb-3 print:mb-2 text-base sm:text-lg print:text-base font-bold text-slate-800 border-b border-slate-100 pb-2 print:pb-2">
                  تفاصيل قطع الغيار
                </h3>
                <p className="min-h-24 print:min-h-24 print:text-sm whitespace-pre-wrap text-sm print:leading-relaxed leading-relaxed text-slate-700">
                  {invoice.parts_details || "لا توجد قطع غيار مسجلة"}
                </p>
              </section>
            </div>

            {/* Footer */}
            <footer className="mt-12 print:mt-8 pt-6 print:pt-4 border-t border-slate-200 text-center text-base sm:text-lg print:text-sm font-bold text-slate-500 space-y-2 print:space-y-1">
              <p className="font-extrabold text-slate-700">{branchAddress}</p>
              <p className="text-lg sm:text-xl print:text-base font-extrabold text-slate-850">شكراً لاختياركم مركز عبدالله باوزير لصيانة السيارات.</p>
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
