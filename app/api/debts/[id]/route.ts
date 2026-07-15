import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بالدخول" }, { status: 401 });
    }

    const { id } = await params;
    const debtor = await prisma.debtor.findUnique({
      where: { id },
    });

    if (!debtor) {
      return NextResponse.json({ error: "المديون غير موجود" }, { status: 404 });
    }

    return NextResponse.json(debtor);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بالدخول" }, { status: 401 });
    }

    const { id } = await params;
    const { name, phone, address } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 });
    }

    const debtor = await prisma.debtor.update({
      where: { id },
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        address: address?.trim() || null,
      },
    });

    return NextResponse.json(debtor);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بالدخول" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.debtor.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
