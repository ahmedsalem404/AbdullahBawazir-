"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { FileText, Printer, X, ClipboardCheck, Share2 } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { WORKSHOP_NAME } from "./constants";

interface BuySellReportModalProps {
  onClose: () => void;
  branch?: string;
}

/**
 * @component BuySellReportModal
 * @description نافذة منبثقة لإدخال وعرض وطباعة تقرير فحص بيع وشراء للسيارات.
 * يعتمد على الحالة المحلية (Stateless) دون الحفظ في قاعدة البيانات.
 */
export function BuySellReportModal({ onClose, branch = "الحسوة" }: BuySellReportModalProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareFile, setShareFile] = useState<File | null>(null);

  // مشاركة التقرير عبر الـ Web Share API
  async function sharePdf() {
    if (shareFile) {
      try {
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [shareFile] })) {
          await navigator.share({
            files: [shareFile],
            title: "تقرير فحص بيع وشراء",
            text: `مرفق تقرير فحص بيع وشراء الخاص بالسيارة ${carType} من مركز عبدالله باوزير.`,
          });
          setShareFile(null);
        }
      } catch (err) {
        console.error("Failed to share prepared file:", err);
      }
      return;
    }

    if (!reportRef.current) return;
    setIsSharing(true);
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
      const pdfBlob = pdf.output("blob");
      const filename = `Buy-Sell-Inspection-${carType || "car"}.pdf`;
      const file = new File([pdfBlob], filename, { type: "application/pdf" });
      setShareFile(file);

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "تقرير فحص بيع وشراء",
            text: `مرفق تقرير فحص بيع وشراء الخاص بالسيارة ${carType} من مركز عبدالله باوزير.`,
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

  // Form states
  const [carType, setCarType] = useState("");
  const [carModel, setCarModel] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [engine, setEngine] = useState("");
  const [gearbox, setGearbox] = useState("");
  const [computer, setComputer] = useState("");
  const [others, setOthers] = useState("");

  const branchAddress = branch === "الدرين"
    ? "فرع الدرين (الدرين مقابل محطة باهدى)"
    : "فرع الحسوة (الحسوة محطة ومجمع بتر بارك)";

  const currentDate = new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  // تصدير PDF
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
      pdf.save(`Buy-Sell-Inspection-${carType || "car"}.pdf`);
    } catch (err) {
      console.error("Failed to export PDF", err);
    } finally {
      setIsExporting(false);
    }
  }

  // طباعة
  function printReport() {
    window.print();
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
          #printable-buy-sell-report {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
      <div className="w-full max-w-4xl rounded-[2.5rem] border border-slate-200/40 bg-slate-100/50 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-550 ease-[cubic-bezier(0.32,0.72,0,1)] animate-modal-open">
        <div className="max-h-[85vh] w-full overflow-y-auto rounded-[calc(2.5rem-0.5rem)] bg-white p-5 sm:p-8 border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
          
          {/* Header Controls */}
          <div className="no-print mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <ClipboardCheck className="text-brand-green" />
              <span>تقرير فحص بيع وشراء</span>
            </h2>
            <button
              onClick={onClose}
              aria-label="إغلاق"
              className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-90 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Fields */}
          <div className="no-print space-y-6 mb-8">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500">نوع السيارة</label>
                <input
                  type="text"
                  value={carType}
                  onChange={(e) => setCarType(e.target.value)}
                  placeholder="مثال: Toyota Hilux"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500">موديل السيارة (سنة الصنع)</label>
                <input
                  type="text"
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  placeholder="مثال: 2024"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500">رقم اللوحة</label>
                <input
                  type="text"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  placeholder="مثال: 8402 / أ"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500">فحص المكينة</label>
                <textarea
                  value={engine}
                  onChange={(e) => setEngine(e.target.value)}
                  placeholder="ملاحظات فحص المحرك ونظامه فنيًا..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold outline-none transition focus:border-indigo-400 focus:bg-white resize-y"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500">فحص الجير (ناقل الحركة)</label>
                <textarea
                  value={gearbox}
                  onChange={(e) => setGearbox(e.target.value)}
                  placeholder="حالة ناقل الحركة (الأوتوماتيك/العادي) والتبديلات..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold outline-none transition focus:border-indigo-400 focus:bg-white resize-y"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500">فحص الكمبيوتر</label>
                <textarea
                  value={computer}
                  onChange={(e) => setComputer(e.target.value)}
                  placeholder="الأعطال والحساسات ونظام التشخيص بالكمبيوتر..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold outline-none transition focus:border-indigo-400 focus:bg-white resize-y"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500">ملاحظات أخرى (الكهرباء، الهيكل، إلخ)</label>
                <textarea
                  value={others}
                  onChange={(e) => setOthers(e.target.value)}
                  placeholder="أي ملاحظات فنية عامة أخرى على المركبة..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold outline-none transition focus:border-indigo-400 focus:bg-white resize-y"
                />
              </div>
            </div>
          </div>

          {/* Printable Layout */}
          <div className="w-full overflow-x-auto scrollbar-thin">
            <div
              id="printable-buy-sell-report"
              ref={reportRef}
              className="mx-auto w-[794px] bg-white p-12 text-slate-800 border border-slate-100 rounded-2xl flex-shrink-0"
              dir="rtl"
            >
            <header className="mb-6 print:mb-8 flex items-center justify-between border-b-2 border-brand-green pb-6 print:pb-6">
              <div className="flex items-center gap-4">
                <Image
                  src="/bawazir-logo.png"
                  alt={WORKSHOP_NAME}
                  width={96}
                  height={96}
                  className="h-28 w-28 sm:h-32 sm:w-32 print:h-36 print:w-36 object-contain"
                  priority
                />
                <div>
                  <h1 className="text-2xl sm:text-3xl print:text-3xl font-extrabold text-slate-800 tracking-tight">{WORKSHOP_NAME}</h1>
                  <p className="mt-1 text-base sm:text-lg print:text-base font-medium text-slate-500">
                    تقرير فحص بيع وشراء (مبدئي)
                  </p>
                </div>
              </div>
              <div className="text-left text-base sm:text-lg print:text-sm text-slate-600 font-bold space-y-2 print:space-y-1">
                <p>الفرع: <span className="font-extrabold text-slate-800">{branch || "الحسوة"}</span></p>
                <p>الهاتف: <span className="font-extrabold text-slate-800">770533333</span></p>
                <p>التاريخ: <span dir="ltr" className="font-extrabold text-slate-800">{currentDate}</span></p>
              </div>
            </header>

            {/* Vehicle Details */}
            <div className="mb-8 print:mb-6">
              <h3 className="mb-4 print:mb-3 text-base sm:text-lg print:text-base font-bold text-slate-700 border-b border-slate-200 pb-2 print:pb-2">بيانات المركبة المفحوصة</h3>
              <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 print:p-4 rounded-xl border border-slate-100 text-sm print:text-sm">
                <div>
                  <span className="text-slate-400 font-bold">نوع السيارة: </span>
                  <span className="font-black text-slate-800">{carType || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold">الموديل: </span>
                  <span className="font-black text-slate-800">{carModel || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold">رقم اللوحة: </span>
                  <span className="font-black text-slate-800">{plateNumber || "—"}</span>
                </div>
              </div>
            </div>

            {/* General Inspection Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-6 mb-8 print:mb-6">
              <section className="rounded-2xl border border-slate-200 p-5 print:p-5 flex flex-col">
                <h3 className="mb-3 print:mb-2 text-base sm:text-lg print:text-base font-bold text-slate-800 border-b border-slate-100 pb-2 print:pb-2">
                  1. فحص المكينة (المحرك)
                </h3>
                <p className="min-h-20 print:min-h-20 print:text-sm whitespace-pre-wrap text-sm print:leading-relaxed leading-relaxed text-slate-700">
                  {engine || "لا توجد ملاحظات مسجلة"}
                </p>
              </section>

              <section className="rounded-2xl border border-slate-200 p-5 print:p-5 flex flex-col">
                <h3 className="mb-3 print:mb-2 text-base sm:text-lg print:text-base font-bold text-slate-800 border-b border-slate-100 pb-2 print:pb-2">
                  2. فحص الجير (ناقل الحركة)
                </h3>
                <p className="min-h-20 print:min-h-20 print:text-sm whitespace-pre-wrap text-sm print:leading-relaxed leading-relaxed text-slate-700">
                  {gearbox || "لا توجد ملاحظات مسجلة"}
                </p>
              </section>

              <section className="rounded-2xl border border-slate-200 p-5 print:p-5 flex flex-col">
                <h3 className="mb-3 print:mb-2 text-base sm:text-lg print:text-base font-bold text-slate-800 border-b border-slate-100 pb-2 print:pb-2">
                  3. فحص الكمبيوتر
                </h3>
                <p className="min-h-20 print:min-h-20 print:text-sm whitespace-pre-wrap text-sm print:leading-relaxed leading-relaxed text-slate-700">
                  {computer || "لا توجد ملاحظات مسجلة"}
                </p>
              </section>

              <section className="rounded-2xl border border-slate-200 p-5 print:p-5 flex flex-col">
                <h3 className="mb-3 print:mb-2 text-base sm:text-lg print:text-base font-bold text-slate-800 border-b border-slate-100 pb-2 print:pb-2">
                  4. ملاحظات فنية أخرى
                </h3>
                <p className="min-h-20 print:min-h-20 print:text-sm whitespace-pre-wrap text-sm print:leading-relaxed leading-relaxed text-slate-700">
                  {others || "لا توجد ملاحظات مسجلة"}
                </p>
              </section>
            </div>

            {/* Footer */}
            <footer className="mt-12 print:mt-8 pt-6 print:pt-4 border-t border-slate-200 text-center text-base sm:text-lg print:text-sm font-bold text-slate-500 space-y-2 print:space-y-1">
              <p className="font-extrabold text-slate-700">{branchAddress}</p>
              <p className="text-lg sm:text-xl print:text-base font-extrabold text-slate-850">شكراً لاختياركم مركز عبدالله باوزير لصيانة السيارات.</p>
              <p className="text-xs sm:text-sm print:text-xs text-slate-400 font-bold mt-1">هذا التقرير آلي ولا يحتاج إلى ختم أو توقيع</p>
            </footer>
          </div>
        </div>

        {/* Action Buttons */}
          <div className="no-print mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={printReport}
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
              {isExporting ? "جاري تصدير PDF..." : "تنزيل تقرير الفحص PDF"}
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
                  : "مشاركة التقرير"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
