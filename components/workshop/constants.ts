import type { CustomerFormValues } from "@/lib/types";

export const PAGE_SIZE = 6;
export const WORKSHOP_NAME = "مركز عبدالله باوزير لصيانة السيارات";

/**
 * إرجاع تاريخ اليوم بصيغة YYYY-MM-DD
 */
export const todayInputValue = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

/**
 * تنسيق المبلغ ليعرض بالعملة المحددة (سعودي، يمني، دولار)
 */
export const formatCurrency = (value: number, currency: string = "SAR") => {
  const formatted = new Intl.NumberFormat("ar-SA", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(value);

  if (currency === "YER") return `${formatted} ر.ي`;
  if (currency === "USD") return `${formatted} $`;
  return `${formatted} ر.س`;
};

/**
 * تنسيق التاريخ والوقت
 */
export const formatDate = (value: string | Date) =>
  new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

/**
 * قيم مبدئية فارغة لنموذج إضافة العميل
 */
export const emptyForm: CustomerFormValues = {
  customer_name: "",
  phone: "",
  car_type: "",
  car_year: 0,
  engineer_id: "",
  work_notes: "",
  required_amount: 0,
  paid_amount: 0,
  injectors_amount: 0,
  currency: "YER",
  payment_method: "Cash",
  transfer_type: null,
  is_not_worked_on: false,
};

/**
 * تشغيل صوت نجاح العملية (نغمة خفيفة متوافقة مع الأجهزة بدون تحميل ملفات صوتية)
 */
export const playSuccessSound = () => {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // النغمة الأولى
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    gain1.gain.setValueAtTime(0.08, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.12);
    
    // النغمة الثانية
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
    gain2.gain.setValueAtTime(0, ctx.currentTime);
    gain2.gain.setValueAtTime(0.08, ctx.currentTime + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.08);
    osc2.stop(ctx.currentTime + 0.25);
  } catch (e) {
    console.error("Failed to play success sound", e);
  }
};

/**
 * تشغيل صوت خطأ أو تنبيه (نغمة خفيفة متوافقة مع الأجهزة بدون تحميل ملفات صوتية)
 */
export const playErrorSound = () => {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(160, ctx.currentTime); // تردد منخفض للخطأ
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    console.error("Failed to play error sound", e);
  }
};


