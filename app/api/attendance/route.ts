import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date"); // YYYY-MM-DD

    if (!date) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
    }

    const records = await prisma.attendance.findMany({
      where: {
        branch: session.branch,
        date: date,
      },
      include: {
        engineer: true,
      },
      orderBy: {
        time: "asc",
      },
    });

    const result = records.map(r => ({
      id: r.id,
      engineer_id: r.engineer_id,
      engineer_name: r.engineer?.name || "غير معروف",
      branch: r.branch,
      date: r.date,
      time: r.time,
      createdAt: r.createdAt,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET Attendance error:", error);
    return NextResponse.json({ error: "Failed to fetch attendance records" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { engineer_id, date, time } = data;

    if (!engineer_id || !date || !time) {
      return NextResponse.json({ error: "engineer_id, date, and time are required" }, { status: 400 });
    }

    // Restriction: Employees can only check in for today's date
    if (session.role === "WORKER") {
      const today = new Date();
      const offset = 3 * 60; // 3 hours (GMT+3)
      const localTime = new Date(today.getTime() + (today.getTimezoneOffset() + offset) * 60 * 1000);
      const todayString = localTime.toISOString().split("T")[0]; // YYYY-MM-DD

      if (date !== todayString) {
        return NextResponse.json({ error: "عذراً، لا يمكن للموظف تسجيل الحضور إلا لتاريخ اليوم فقط ⚠️" }, { status: 403 });
      }
    }

    // Enforce branch segregation: Check if engineer belongs to session branch. SUPER_ADMIN is exempt.
    const engineer = await prisma.engineer.findUnique({
      where: { id: engineer_id },
    });
    if (!engineer || (session.role !== "SUPER_ADMIN" && engineer.branch !== session.branch) || engineer.isDeleted) {
      return NextResponse.json({ error: "Engineer not found in this branch" }, { status: 404 });
    }

    // Check if engineer is already attended for this date
    const existing = await prisma.attendance.findFirst({
      where: {
        engineer_id,
        date,
      },
    });
    if (existing) {
      return NextResponse.json({ error: "المهندس محضر بالفعل لهذا اليوم" }, { status: 400 });
    }

    const record = await prisma.attendance.create({
      data: {
        engineer_id,
        branch: session.branch,
        date,
        time,
      },
      include: {
        engineer: true,
      },
    });

    return NextResponse.json({
      id: record.id,
      engineer_id: record.engineer_id,
      engineer_name: record.engineer?.name || "غير معروف",
      branch: record.branch,
      date: record.date,
      time: record.time,
      createdAt: record.createdAt,
    });
  } catch (error) {
    console.error("POST Attendance error:", error);
    return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 });
  }
}
