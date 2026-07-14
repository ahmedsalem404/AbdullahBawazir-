"use client";

import React, { useState, useCallback } from "react";
import { X, Calendar, Clock, Trash2, ChevronLeft, ChevronRight, ClipboardCheck, Loader2 } from "lucide-react";
import Image from "next/image";
import type { Engineer, Attendance } from "@/lib/types";
import { useAttendance } from "@/hooks/useAttendance";
import { ConfirmModal } from "./modals";
import { WORKSHOP_NAME } from "./constants";

/**
 * تحويل وقت 24 ساعة (HH:MM) إلى صيغة 12 ساعة مع الإشارة لصباحاً/مساءً
 */
function formatTime12(timeStr: string): string {
  if (!timeStr || !timeStr.includes(":")) return timeStr;
  const [hourStr, minStr] = timeStr.split(":");
  let hour = Number(hourStr);
  const min = minStr;
  const period = hour >= 12 ? "مساءً" : "صباحاً";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  const formattedHour = String(hour).padStart(2, "0");
  return `${formattedHour}:${min} ${period}`;
}

interface AttendanceModalProps {
  onClose: () => void;
  isManager: boolean;
}

export function AttendanceModal({ onClose, isManager }: AttendanceModalProps) {
  const {
    selectedDate,
    setSelectedDate,
    records,
    engineers,
    loading,
    toast,
    recordAttendance,
    deleteAttendance,
  } = useAttendance();

  const today = new Date();
  const offset = 3 * 60; // GMT+3
  const localTime = new Date(today.getTime() + (today.getTimezoneOffset() + offset) * 60 * 1000);
  const todayString = localTime.toISOString().split("T")[0];
  const isToday = selectedDate === todayString;

  const [confirmTarget, setConfirmTarget] = useState<Engineer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // التنقل بين الأيام
  const adjustDate = useCallback((days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split("T")[0]);
  }, [selectedDate, setSelectedDate]);

  // هل المهندس محضر اليوم؟
  const getAttendanceRecord = useCallback((engineerId: string): Attendance | undefined => {
    return records.find((r) => r.engineer_id === engineerId);
  }, [records]);

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
        <div className="max-h-[85vh] w-full overflow-y-auto rounded-[calc(2.5rem-0.5rem)] bg-white p-5 sm:p-8 border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]" dir="rtl">
          {/* Header */}
          <div className="no-print mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                <ClipboardCheck size={24} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">تحضير المهندسين اليومي</h2>
                <p className="text-sm font-semibold text-slate-500">إدارة وتسجيل حضور كادر الصيانة الفني</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              aria-label="إغلاق"
              className="absolute left-8 top-8 sm:static grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-90 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Date Picker Bar */}
          <div className="mb-8 flex items-center justify-center gap-2 sm:gap-4 rounded-3xl bg-slate-50 p-4 border border-slate-150/80">
            <button
              onClick={() => adjustDate(-1)}
              className="grid h-11 w-11 place-items-center rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all active:scale-90 cursor-pointer"
              title="اليوم السابق"
            >
              <ChevronRight size={20} />
            </button>

            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm w-full max-w-xs justify-center">
              <Calendar size={18} className="text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="font-extrabold text-slate-700 outline-none text-sm sm:text-base cursor-pointer"
              />
            </div>

            <button
              onClick={() => adjustDate(1)}
              className="grid h-11 w-11 place-items-center rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all active:scale-90 cursor-pointer"
              title="اليوم التالي"
            >
              <ChevronLeft size={20} />
            </button>
          </div>

          {loading ? (
            <div className="flex h-60 items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <span className="text-sm font-bold text-slate-500">جارٍ تحميل سجلات التحضير...</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Column 1: Engineers List (7 cols) */}
              <div className="lg:col-span-7 rounded-3xl border border-slate-150 p-5 sm:p-6 bg-slate-50/20">
                <h3 className="mb-4 text-base sm:text-lg font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span>قائمة تحضير المهندسين</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500">
                    {engineers.length} مهندسين
                  </span>
                </h3>

                {engineers.length === 0 ? (
                  <div className="flex h-48 flex-col items-center justify-center text-center p-4">
                    <p className="font-bold text-slate-400">لا يوجد مهندسين مسجلين في هذا الفرع حالياً.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {engineers.map((engineer) => {
                      const record = getAttendanceRecord(engineer.id);
                      const isAttended = !!record;

                      return (
                        <div
                          key={engineer.id}
                          className="flex items-center justify-between rounded-2xl border border-slate-150 bg-white p-4 shadow-sm transition-all hover:shadow-md"
                        >
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-slate-800 text-base truncate">{engineer.name}</h4>
                            <p className="text-xs font-medium text-slate-400 mt-0.5">{engineer.phone || "بدون رقم هاتف"}</p>
                          </div>

                          <div>
                            {isAttended ? (
                              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-1.5 text-xs sm:text-sm font-bold text-emerald-700">
                                <Clock size={14} />
                                <span>محضر {formatTime12(record.time)}</span>
                              </div>
                            ) : (
                              !isManager && !isToday ? (
                                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                                  التحضير متاح لليوم فقط
                                </span>
                              ) : (
                                <button
                                  onClick={() => setConfirmTarget(engineer)}
                                  className="inline-flex items-center gap-1.5 rounded-2xl bg-brand-green px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-brand-greenDark active:scale-95 transition-all cursor-pointer"
                                >
                                  تسجيل حضور ⏱️
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Column 2: Today's Logs (5 cols) */}
              <div className="lg:col-span-5 rounded-3xl border border-slate-150 p-5 sm:p-6 bg-slate-50/20">
                <h3 className="mb-4 text-base sm:text-lg font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span>سجل حضور اليوم المختار</span>
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                    {records.length} حاضرين
                  </span>
                </h3>

                {records.length === 0 ? (
                  <div className="flex h-48 flex-col items-center justify-center text-center p-4">
                    <p className="font-bold text-slate-400">لا يوجد سجل تحضير لليوم المختار.</p>
                  </div>
                ) : (
                  <div className="grid gap-3 max-h-[420px] overflow-y-auto pr-1">
                    {records.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5"
                      >
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-800 text-sm truncate">{record.engineer_name || "مهندس"}</h4>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 mt-1">
                            <Clock size={12} />
                            {formatTime12(record.time)}
                          </span>
                        </div>

                        {isManager ? (
                          <button
                            onClick={() => setDeleteTarget(record.id)}
                            className="grid h-9 w-9 place-items-center rounded-xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 hover:text-red-700 active:scale-90 transition-all cursor-pointer"
                            title="إلغاء التحضير"
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Confirmations Modals */}
          {confirmTarget ? (
            <ConfirmModal
              title="تأكيد تسجيل الحضور"
              body={`هل أنت متأكد من رغبتك في تسجيل حضور المهندس ${confirmTarget.name} لليوم المختار (${selectedDate})؟`}
              onCancel={() => setConfirmTarget(null)}
              onConfirm={() => {
                recordAttendance(confirmTarget.id);
                setConfirmTarget(null);
              }}
              confirmLabel="تحضير"
              confirmBtnColor="bg-brand-green hover:bg-brand-greenDark"
            />
          ) : null}

          {deleteTarget ? (
            <ConfirmModal
              title="إلغاء تحضير المهندس"
              body="هل أنت متأكد من رغبتك في إلغاء تحضير هذا المهندس وحذف سجل الحضور لهذا اليوم؟"
              onCancel={() => setDeleteTarget(null)}
              onConfirm={() => {
                deleteAttendance(deleteTarget);
                setDeleteTarget(null);
              }}
              confirmLabel="إلغاء التحضير"
              confirmBtnColor="bg-brand-red hover:bg-red-700"
            />
          ) : null}

          {/* Toast Notification */}
          {toast ? (
            <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 w-max max-w-[90vw] px-4 transition-all duration-300">
              <div className={`flex items-center justify-center gap-3 rounded-2xl border px-6 py-4 shadow-soft backdrop-blur-md text-sm sm:text-base font-extrabold text-center transition-all duration-300 ${
                toast.type === "success"
                  ? "border-emerald-200 bg-white/90 text-emerald-800 shadow-[0_10px_35px_-5px_rgba(16,185,129,0.15)]"
                  : "border-red-200 bg-white/90 text-red-800 shadow-[0_10px_35px_-5px_rgba(239,68,68,0.15)]"
              }`}>
                <span>{toast.message}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
