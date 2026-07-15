import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

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
    const { amount, details } = await request.json();

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "المبلغ يجب أن يكون أكبر من صفر" }, { status: 400 });
    }

    const transaction = await prisma.debtTransaction.update({
      where: { id },
      data: {
        amount,
        details: details?.trim() || null,
      },
    });

    return NextResponse.json(transaction);
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
    await prisma.debtTransaction.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
