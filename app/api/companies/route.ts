import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companies = await prisma.company.findMany({
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(companies);
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

    const { name, location, contact_number } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "اسم الشركة مطلوب" }, { status: 400 });
    }

    const company = await prisma.company.create({
      data: {
        name: name.trim(),
        location: location?.trim() || null,
        contact_number: contact_number?.trim() || null,
        branch: session.branch,
      },
    });

    return NextResponse.json(company);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
