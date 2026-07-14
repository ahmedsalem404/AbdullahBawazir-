"use client";

import React, { useState, useRef, useEffect } from "react";
import { ClipboardList, ChevronDown, FileText, Wrench } from "lucide-react";

interface InspectionReportsMenuProps {
  onOpenBuySellReport: () => void;
  onOpenRegularReport: () => void;
}

/**
 * @component InspectionReportsMenu
 * @description قائمة منسدلة بتصميم Apple الأنيق تتيح للمستخدمين اختيار نوع تقرير الفحص المؤقت لإنشائه وطباعته.
 */
export function InspectionReportsMenu({
  onOpenBuySellReport,
  onOpenRegularReport,
}: InspectionReportsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // إغلاق القائمة عند الضغط خارج المكون
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-11 items-center gap-2 rounded-2xl bg-slate-100 px-5 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95 cursor-pointer"
        type="button"
      >
        <ClipboardList size={18} />
        <span>تقارير الفحص</span>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 rounded-2xl border border-slate-200/50 bg-white/95 p-2 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-300 z-50">
          <button
            onClick={() => {
              onOpenBuySellReport();
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-right text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors duration-250 cursor-pointer"
            type="button"
          >
            <FileText size={16} className="text-slate-400" />
            <span>📄 تقرير فحص بيع وشراء</span>
          </button>
          <button
            onClick={() => {
              onOpenRegularReport();
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-right text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors duration-250 cursor-pointer"
            type="button"
          >
            <Wrench size={16} className="text-slate-400" />
            <span>🛠️ تقرير فحص عادي</span>
          </button>
        </div>
      )}
    </div>
  );
}
