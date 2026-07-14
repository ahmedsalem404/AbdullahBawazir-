import { useEffect, useState } from "react";
import { Profile } from "@/types/workshop";
import { loginService, logoutService, getMeService } from "@/services/auth";

/**
 * خطاف مخصص لإدارة مصادقة المستخدم وجلسة العمل
 */
export function useAuth() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // التحقق من صحة الجلسة الفعالة
  const checkSession = async () => {
    if (!sessionStorage.getItem("tab_session_active")) {
      try {
        await logoutService();
      } catch (e) {}
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const user = await getMeService();
      setProfile(user);
    } catch (err) {
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  // فحص الجلسة عند التحميل الأول
  useEffect(() => {
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // فحص صحة الجلسة دورياً كل دقيقة
  useEffect(() => {
    if (!profile) return;

    const interval = setInterval(async () => {
      try {
        const user = await getMeService();
        if (!user) {
          setProfile(null);
        }
      } catch (err) {
        setProfile(null);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [profile]);

  /**
   * تسجيل الدخول للفرع
   */
  const login = async (username: string, password: string, branch: string): Promise<boolean> => {
    setAuthError("");
    try {
      const user = await loginService(username, password, branch);
      setProfile(user);
      sessionStorage.setItem("tab_session_active", "true");
      return true;
    } catch (err: any) {
      setAuthError(err.message || "تعذر تسجيل الدخول");
      return false;
    }
  };

  /**
   * تسجيل الخروج ومسح الجلسة
   */
  const logout = async (): Promise<void> => {
    try {
      await logoutService();
    } catch (e) {}
    sessionStorage.removeItem("tab_session_active");
    setProfile(null);
  };

  return {
    profile,
    authError,
    isLoading,
    login,
    logout,
    setProfile,
    setAuthError,
    checkSession,
  };
}
