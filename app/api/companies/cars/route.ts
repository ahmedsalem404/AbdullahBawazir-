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
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json({ error: "معرف الشركة مطلوب" }, { status: 400 });
    }

    const cars = await prisma.companyCar.findMany({
      where: { company_id: companyId },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(cars);
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

    const { company_id, name, year, color, plate_or_chassis } = await request.json();

    if (!company_id || !name?.trim() || !year || !plate_or_chassis?.trim()) {
      return NextResponse.json({ error: "جميع الحقول المطلوبة يجب ملؤها" }, { status: 400 });
    }

    const car = await prisma.companyCar.create({
      data: {
        company_id,
        name: name.trim(),
        year: parseInt(year),
        color: color?.trim() || null,
        plate_or_chassis: plate_or_chassis.trim(),
      },
    });

    return NextResponse.json(car);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "معرف السيارة مطلوب" }, { status: 400 });
    }

    const { name, year, color, plate_or_chassis } = await request.json();

    if (!name?.trim() || !year || !plate_or_chassis?.trim()) {
      return NextResponse.json({ error: "جميع الحقول المطلوبة يجب ملؤها" }, { status: 400 });
    }

    const car = await prisma.companyCar.update({
      where: { id },
      data: {
        name: name.trim(),
        year: parseInt(year),
        color: color?.trim() || null,
        plate_or_chassis: plate_or_chassis.trim(),
      },
    });

    return NextResponse.json(car);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "معرف السيارة مطلوب" }, { status: 400 });
    }

    await prisma.companyCar.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
