"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, User, Lock, MapPin, ChevronLeft } from "lucide-react";
import { WORKSHOP_NAME } from "./constants";

/**
 * @component LoginScreen
 * @description شاشة تسجيل الدخول.
 * تتيح للمستخدم أو المدير إدخال البريد الإلكتروني وكلمة المرور واختيار الفرع للوصول إلى النظام.
 */
export function LoginScreen({
  authError,
  onLogin,
}: {
  authError: string;
  onLogin: (username: string, password: string, branch: string) => Promise<void>;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [branch, setBranch] = useState("الحسوة");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4 py-10 overflow-hidden">
      {/* Dynamic Ambient Glow Keyframe Style */}
      <style>{`
        @keyframes floatGlowOne {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(30px, 20px) scale(1.1); }
        }
        @keyframes floatGlowTwo {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-30px, -20px) scale(1.05); }
        }
        .float-glow-1 {
          animation: floatGlowOne 20s ease-in-out infinite;
        }
        .float-glow-2 {
          animation: floatGlowTwo 25s ease-in-out infinite;
        }
      `}</style>

      {/* Background ambient glow */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-brand-green/8 blur-[120px] float-glow-1" />
        <div className="absolute -bottom-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-blue-600/6 blur-[120px] float-glow-2" />
      </div>

      <div className="relative z-10 w-full max-w-[450px] rounded-[2.5rem] border border-slate-200/40 bg-slate-100/50 p-2 shadow-[0_16px_50px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-all duration-300">
        <form
          className="w-full rounded-[calc(2.5rem-0.5rem)] bg-white/95 p-6 sm:p-8 text-center border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]"
          onSubmit={async (event) => {
            event.preventDefault();
            setIsSubmitting(true);
            await onLogin(username, password, branch);
            setIsSubmitting(false);
          }}
        >
          <div className="relative mx-auto mb-6 h-28 w-28 flex items-center justify-center">
            <Image
              src="/bawazir-logo.png"
              alt={WORKSHOP_NAME}
              width={112}
              height={112}
              className="scale-[2.05] object-contain"
              priority
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight leading-snug">{WORKSHOP_NAME}</h1>
          <p className="mt-2 text-sm text-slate-550 font-bold">نظام الإدارة الفني الموحد</p>

          <div className="mt-8 space-y-5 text-right">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                اسم المستخدم
              </span>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-brand-line bg-white pr-11 pl-4 text-base outline-none transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus:border-brand-green focus:ring-4 focus:ring-brand-green/12 placeholder-slate-400"
                  autoComplete="username"
                  required
                  placeholder="أدخل اسم المستخدم"
                />
              </div>
            </label>
            
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                كلمة المرور
              </span>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? "text" : "password"}
                  className="h-12 w-full rounded-2xl border border-brand-line bg-white pr-11 pl-12 text-base outline-none transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus:border-brand-green focus:ring-4 focus:ring-brand-green/12 placeholder-slate-400"
                  autoComplete="current-password"
                  required
                  placeholder="أدخل كلمة المرور"
                />
                <button
                  type="button"
                  aria-label={
                    showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                  }
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 active:scale-90"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                فرع التسجيل النشط
              </span>
              <div className="relative">
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select
                  value={branch}
                  onChange={(event) => setBranch(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-brand-line bg-white pr-11 pl-4 text-base outline-none transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] focus:border-brand-green focus:ring-4 focus:ring-brand-green/12 appearance-none cursor-pointer"
                  required
                >
                  <option value="الحسوة">فرع الحسوة (Al-Haswa Branch)</option>
                  <option value="الدرين">فرع الدرين (Al-Durein Branch)</option>
                </select>
              </div>
            </label>
          </div>

          {authError ? (
            <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 border border-red-100">
              {authError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="group mt-8 flex h-12 w-full items-center justify-between rounded-2xl bg-brand-green pl-2 pr-6 text-base font-bold text-white shadow-card transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-brand-greenDark active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
          >
            <span>{isSubmitting ? "جار التحقق..." : "دخول النظام"}</span>
            <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-[-4px] transition-transform duration-300">
              <ChevronLeft size={16} />
            </span>
          </button>
        </form>
      </div>
    </main>
  );
}
