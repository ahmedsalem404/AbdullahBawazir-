import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const carId = searchParams.get("carId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const accounted = searchParams.get("accounted");
    const sent = searchParams.get("sent");

    if (!carId) {
      return NextResponse.json({ error: "معرف السيارة مطلوب" }, { status: 400 });
    }

    const whereClause: any = { car_id: carId };

    // Month & Year Filter
    if (month && month !== "all") {
      const m = parseInt(month);
      const y = year && year !== "all" ? parseInt(year) : new Date().getFullYear();
      const startDate = new Date(y, m - 1, 1);
      const endDate = new Date(y, m, 1);
      whereClause.created_at = {
        gte: startDate,
        lt: endDate,
      };
    } else if (year && year !== "all") {
      const y = parseInt(year);
      const startDate = new Date(y, 0, 1);
      const endDate = new Date(y + 1, 0, 1);
      whereClause.created_at = {
        gte: startDate,
        lt: endDate,
      };
    }

    // Accounted Filter: "all" | "true" | "false"
    if (accounted && accounted !== "all") {
      whereClause.is_accounted = accounted === "true";
    }

    // Sent Filter: "all" | "true" | "false"
    if (sent && sent !== "all") {
      whereClause.is_sent = sent === "true";
    }

    const invoices = await prisma.companyInvoice.findMany({
      where: whereClause,
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(invoices);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      car_id,
      work_details,
      parts_details,
      parts_total,
      labor_total,
      currency,
      is_accounted,
      is_sent,
    } = await request.json();

    if (!car_id || !work_details?.trim()) {
      return NextResponse.json({ error: "تفاصيل العمل ومعرف السيارة مطلوبان" }, { status: 400 });
    }

    const pTotal = parseFloat(parts_total || "0");
    const lTotal = parseFloat(labor_total || "0");
    const grandTotal = pTotal + lTotal; // Calculated server-side for safety

    const invoice = await prisma.companyInvoice.create({
      data: {
        car_id,
        work_details: work_details.trim(),
        parts_details: parts_details?.trim() || null,
        parts_total: pTotal,
        labor_total: lTotal,
        grand_total: grandTotal,
        currency: currency || "SAR",
        is_accounted: !!is_accounted,
        is_sent: !!is_sent,
        branch: session.branch,
      },
    });

    return NextResponse.json(invoice);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
