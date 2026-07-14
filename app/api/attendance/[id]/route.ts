import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role restriction: Only SUPER_ADMIN and ADMIN can delete attendance records (إلغاء التحضير)
    if (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Managers only." }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Attendance ID is required" }, { status: 400 });
    }

    // Enforce branch segregation: Check if record belongs to session branch. SUPER_ADMIN is exempt.
    const existing = await prisma.attendance.findUnique({
      where: { id },
    });
    if (!existing || (session.role !== "SUPER_ADMIN" && existing.branch !== session.branch)) {
      return NextResponse.json({ error: "Attendance record not found in this branch" }, { status: 404 });
    }

    await prisma.attendance.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Attendance error:", error);
    return NextResponse.json({ error: "Failed to delete attendance record" }, { status: 500 });
  }
}
