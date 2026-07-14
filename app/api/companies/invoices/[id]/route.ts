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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const {
      work_details,
      parts_details,
      parts_total,
      labor_total,
      currency,
      is_accounted,
      is_sent,
    } = await request.json();

    if (!work_details?.trim()) {
      return NextResponse.json({ error: "تفاصيل العمل مطلوبة" }, { status: 400 });
    }

    const pTotal = parseFloat(parts_total || "0");
    const lTotal = parseFloat(labor_total || "0");
    const grandTotal = pTotal + lTotal; // Calculated server-side for safety

    const invoice = await prisma.companyInvoice.update({
      where: { id },
      data: {
        work_details: work_details.trim(),
        parts_details: parts_details?.trim() || null,
        parts_total: pTotal,
        labor_total: lTotal,
        grand_total: grandTotal,
        currency,
        is_accounted: !!is_accounted,
        is_sent: !!is_sent,
      },
    });

    return NextResponse.json(invoice);
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.companyInvoice.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
