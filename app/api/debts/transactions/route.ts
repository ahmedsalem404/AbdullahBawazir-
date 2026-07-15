import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { DebtType, DebtCurrency } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بالدخول" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const debtor_id = searchParams.get("debtor_id");
    const currency = searchParams.get("currency");

    if (!debtor_id) {
      return NextResponse.json({ error: "معرف المديون مطلوب" }, { status: 400 });
    }

    const where: any = { debtor_id };
    if (currency) {
      where.currency = currency as DebtCurrency;
    }

    const transactions = await prisma.debtTransaction.findMany({
      where,
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(transactions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بالدخول" }, { status: 401 });
    }

    const { debtor_id, type, amount, currency, details } = await request.json();

    if (!debtor_id) {
      return NextResponse.json({ error: "معرف المديون مطلوب" }, { status: 400 });
    }
    if (!type || !["LEH", "ALAYH"].includes(type)) {
      return NextResponse.json({ error: "نوع الحركة غير صالح" }, { status: 400 });
    }
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "المبلغ يجب أن يكون أكبر من صفر" }, { status: 400 });
    }
    if (!currency || !["YER", "SAR", "USD"].includes(currency)) {
      return NextResponse.json({ error: "العملة غير صالحة" }, { status: 400 });
    }

    const transaction = await prisma.debtTransaction.create({
      data: {
        debtor_id,
        type: type as DebtType,
        amount,
        currency: currency as DebtCurrency,
        details: details?.trim() || null,
      },
    });

    return NextResponse.json(transaction);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
