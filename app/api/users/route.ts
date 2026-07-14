import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح بالدخول. صلاحيات سوبر أدمن فقط." }, { status: 403 });
    }

    const users = await prisma.profile.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        full_name: true,
        role: true,
        branch: true,
        isActive: true,
        createdAt: true
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("GET users error:", error);
    return NextResponse.json({ error: "فشل جلب المستخدمين" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح. صلاحيات سوبر أدمن فقط." }, { status: 403 });
    }

    const data = await request.json();
    const { username, password, full_name, role, branch } = data;

    if (!username || !password || !full_name || !role) {
      return NextResponse.json({ error: "اسم المستخدم، كلمة المرور، الاسم الكامل والصلاحية حقول مطلوبة" }, { status: 400 });
    }

    // تحقق من عدم تكرار اسم المستخدم
    const existing = await prisma.profile.findUnique({
      where: { username }
    });
    if (existing) {
      return NextResponse.json({ error: "اسم المستخدم هذا مسجل بالفعل" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.profile.create({
      data: {
        username,
        password: hashedPassword,
        full_name,
        role,
        branch: branch || "الحسوة",
        isActive: true
      },
      select: {
        id: true,
        username: true,
        full_name: true,
        role: true,
        branch: true,
        isActive: true,
        createdAt: true
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("POST user error:", error);
    return NextResponse.json({ error: "فشل إنشاء المستخدم" }, { status: 500 });
  }
}
