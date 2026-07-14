import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "super-secret-local-key");

export async function POST(request: NextRequest) {
  try {
    const { username, password, branch } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "اسم المستخدم وكلمة المرور مطلوبان" }, { status: 400 });
    }

    const user = await prisma.profile.findUnique({
      where: { username }
    });

    if (!user) {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
    }

    // Check if account is active
    if (!user.isActive) {
      return NextResponse.json({ error: "هذا الحساب معطل حالياً. يرجى مراجعة مسؤول النظام ⚠️" }, { status: 403 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
    }

    // Decode and normalize branch names to avoid encoding issues with Arabic characters
    const safeDecode = (str: string) => {
      try {
        return decodeURIComponent(str).trim();
      } catch (e) {
        return str.trim();
      }
    };

    const activeBranch = safeDecode(branch || "الحسوة");
    const userBranch = safeDecode(user.branch || "الحسوة");

    console.log(`[Auth Diagnostic] Login attempt for user: ${username}`);
    console.log(`[Auth Diagnostic] Received raw branch: ${branch}`);
    console.log(`[Auth Diagnostic] Decoded active branch: ${activeBranch}`);
    console.log(`[Auth Diagnostic] Registered user branch (raw): ${user.branch}`);
    console.log(`[Auth Diagnostic] Registered user branch (decoded): ${userBranch}`);

    // Enforce branch boundaries: ADMIN and WORKER must match their registered branch. SUPER_ADMIN is exempt.
    if (user.role !== "SUPER_ADMIN" && userBranch !== activeBranch) {
      console.warn(`[Auth Diagnostic] Access Denied: User branch (${userBranch}) does not match active branch (${activeBranch})`);
      return NextResponse.json({ 
        error: `هذا الحساب غير مصرح له بالدخول إلى فرع ${activeBranch}. فرعك المسجل هو: ${userBranch}` 
      }, { status: 403 });
    }

    // Create session token with branch info embedded
    const token = await new SignJWT({ id: user.id, username: user.username, role: user.role, branch: activeBranch })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

    // Fetch last backup date
    const settings = await prisma.systemSettings.findFirst();
    const last_backup_date = settings?.last_backup_date ? settings.last_backup_date.toISOString() : null;

    const response = NextResponse.json({
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      branch: activeBranch,
      last_backup_date
    });

    // maxAge غير محدد ← الكوكي يُحذف تلقائياً عند إغلاق المتصفح
    response.cookies.set({
      name: "workshop_session",
      value: token,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: false
    });

    return response;
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء تسجيل الدخول" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("workshop_session");
  return response;
}
