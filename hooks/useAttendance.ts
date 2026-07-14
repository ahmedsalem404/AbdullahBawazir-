import { useState, useEffect, useCallback } from "react";
import { Attendance, Engineer } from "@/types/workshop";
import {
  getAttendanceByDateService,
  recordAttendanceService,
  deleteAttendanceService
} from "@/services/attendance";
import { getEngineersService } from "@/services/engineers";
import { playSuccessSound, playErrorSound } from "@/components/workshop/constants";

/**
 * خطاف مخصص لإدارة حالة التحضير اليومي للمهندسين
 */
export function useAttendance() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    // ضبط الوقت المحلي للفرع (GMT+3 لليمن/السعودية)
    const offset = 3 * 60; // بالدقائق
    const localTime = new Date(today.getTime() + (today.getTimezoneOffset() + offset) * 60 * 1000);
    return localTime.toISOString().split("T")[0];
  });

  const [records, setRecords] = useState<Attendance[]>([]);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    if (type === "success") {
      playSuccessSound();
    } else {
      playErrorSound();
    }
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // جلب البيانات من السيرفر
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [engs, atts] = await Promise.all([
        getEngineersService(),
        getAttendanceByDateService(selectedDate)
      ]);
      setEngineers(engs);
      setRecords(atts);
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "فشل جلب بيانات التحضير والمهندسين ⚠️", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedDate, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // تحضير مهندس
  const recordAttendance = useCallback(async (engineerId: string) => {
    try {
      const now = new Date();
      const offset = 3 * 60; // GMT+3
      const localTime = new Date(now.getTime() + (now.getTimezoneOffset() + offset) * 60 * 1000);
      const timeString = localTime.toTimeString().split(" ")[0].substring(0, 5); // HH:MM

      const record = await recordAttendanceService(engineerId, selectedDate, timeString);
      setRecords(prev => [...prev, record]);
      showToast("تم تسجيل حضور المهندس بنجاح ⏱️✅", "success");
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "فشل تسجيل تحضير المهندس ⚠️", "error");
    }
  }, [selectedDate, showToast]);

  // إلغاء تحضير
  const deleteAttendance = useCallback(async (attendanceId: string) => {
    try {
      await deleteAttendanceService(attendanceId);
      setRecords(prev => prev.filter(r => r.id !== attendanceId));
      showToast("تم إلغاء تحضير المهندس بنجاح 🗑️✅", "success");
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "فشل إلغاء تحضير المهندس ⚠️", "error");
    }
  }, [showToast]);

  return {
    selectedDate,
    setSelectedDate,
    records,
    engineers,
    loading,
    toast,
    clearToast,
    recordAttendance,
    deleteAttendance,
    refresh: loadData
  };
}
