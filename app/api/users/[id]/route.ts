import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import bcrypt from "bcryptjs";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح. صلاحيات سوبر أدمن فقط." }, { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();
    const { username, password, full_name, role, branch, isActive } = data;

    if (!username || !full_name || !role) {
      return NextResponse.json({ error: "اسم المستخدم، الاسم الكامل، والصلاحية حقول مطلوبة" }, { status: 400 });
    }

    // تحقق من فرادة اسم المستخدم
    const existing = await prisma.profile.findFirst({
      where: {
        username,
        NOT: { id }
      }
    });
    if (existing) {
      return NextResponse.json({ error: "اسم المستخدم هذا مسجل بالفعل لمستخدم آخر" }, { status: 400 });
    }

    // تحضير بيانات التعديل
    const updateData: any = {
      username,
      full_name,
      role,
      branch: branch || "الحسوة",
    };

    // منع تغيير صلاحية الذات لتفادي قفل الحساب
    if (id === session.id) {
      if (role !== session.role) {
        return NextResponse.json({ error: "لا يمكنك تغيير صلاحيتك الإدارية الخاصة بك لتجنب فقدان صلاحية السوبر أدمن ⚠️" }, { status: 400 });
      }
    }

    if (isActive !== undefined) {
      // منع تعطيل حساب الذات
      if (id === session.id && isActive === false) {
        return NextResponse.json({ error: "لا يمكنك إلغاء تفعيل حسابك الحالي بنفسك" }, { status: 400 });
      }
      updateData.isActive = isActive;
    }

    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.profile.update({
      where: { id },
      data: updateData,
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
    console.error("PUT user error:", error);
    return NextResponse.json({ error: "فشل تحديث المستخدم" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح. صلاحيات سوبر أدمن فقط." }, { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();
    const { isActive } = data;

    if (isActive === undefined) {
      return NextResponse.json({ error: "حالة الحساب مطلوبة" }, { status: 400 });
    }

    if (id === session.id) {
      return NextResponse.json({ error: "لا يمكنك إلغاء تفعيل حسابك الحالي بنفسك" }, { status: 400 });
    }

    const user = await prisma.profile.update({
      where: { id },
      data: { isActive },
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
    console.error("PATCH user error:", error);
    return NextResponse.json({ error: "فشل تعديل حالة الحساب" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح. صلاحيات سوبر أدمن فقط." }, { status: 403 });
    }

    const { id } = await params;

    if (id === session.id) {
      return NextResponse.json({ error: "لا يمكنك حذف حسابك الحالي بنفسك" }, { status: 400 });
    }

    await prisma.profile.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE user error:", error);
    return NextResponse.json({ error: "فشل حذف المستخدم" }, { status: 500 });
  }
}
