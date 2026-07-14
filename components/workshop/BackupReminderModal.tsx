"use client";

import React from "react";
import { ShieldAlert, Download } from "lucide-react";

interface BackupReminderModalProps {
  onClose: () => void;
  onGoToBackup: () => void;
}

export function BackupReminderModal({ onClose, onGoToBackup }: BackupReminderModalProps) {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 px-4 py-6 backdrop-blur-md">
      <style>{`
        @keyframes pulseAlert {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
        }
        @keyframes slideIn {
          from { transform: translateY(24px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-pulse-alert {
          animation: pulseAlert 2s infinite ease-in-out;
        }
        .animate-slide-in {
          animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
      
      <div className="w-full max-w-lg rounded-[2.5rem] border-2 border-red-200 bg-white/95 p-2 shadow-[0_32px_64px_rgba(0,0,0,0.18)] backdrop-blur-xl animate-slide-in">
        <div className="w-full rounded-[calc(2.5rem-0.5rem)] bg-white p-6 sm:p-8 border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] text-center space-y-6" dir="rtl">
          
          {/* Pulsing Warning Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 animate-pulse-alert">
            <ShieldAlert size={44} />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-red-600 tracking-tight">
              تنبيه أمني هام وعاجل ⚠️
            </h2>
            <p className="text-xs font-black text-slate-400">
              إدارة سلامة البيانات والأنظمة
            </p>
          </div>

          {/* Message */}
          <p className="text-base text-slate-600 leading-relaxed font-bold bg-red-50/50 p-4 rounded-2xl border border-red-100/50">
            مرت أكثر من 3 أشهر (90 يوماً) منذ آخر نسخة احتياطية لقاعدة البيانات. 
            يرجى أخذ نسخة الآن لضمان عدم فقدان بيانات المركز والعملاء في حالة الطوارئ.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onGoToBackup}
              className="flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 text-base font-bold text-white shadow-[0_8px_20px_rgba(220,38,38,0.25)] transition-all duration-300 hover:bg-red-700 active:scale-95 cursor-pointer"
            >
              <Download size={18} />
              عمل نسخة احتياطية الآن
            </button>
            <button
              onClick={onClose}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-100 px-6 text-base font-bold text-slate-500 transition-all duration-300 hover:bg-slate-200 active:scale-95 cursor-pointer"
            >
              تخطي التنبيه مؤقتاً
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
