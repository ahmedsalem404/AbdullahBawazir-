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
    const date = searchParams.get("date");

    const where: any = { 
      branch: session.branch,
      isDeleted: false 
    };

    if (date) {
      const attendances = await prisma.attendance.findMany({
        where: {
          branch: session.branch,
          date: date
        },
        select: {
          engineer_id: true
        }
      });
      const attendedIds = attendances.map(a => a.engineer_id);
      where.id = { in: attendedIds };
    }

    const engineers = await prisma.engineer.findMany({
      where,
      orderBy: { name: "asc" }
    });
    return NextResponse.json(engineers);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch engineers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const engineer = await prisma.engineer.create({
      data: {
        name: data.name,
        phone: data.phone,
        address: data.address,
        branch: session.branch
      }
    });
    return NextResponse.json(engineer);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create engineer" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role restriction: Only SUPER_ADMIN and ADMIN can delete engineers
    if (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Managers only." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "Engineer ID is required" }, { status: 400 });
    }

    // Enforce branch segregation: ADMIN must match branch. SUPER_ADMIN is exempt.
    const existing = await prisma.engineer.findUnique({
      where: { id }
    });
    if (!existing || (session.role !== "SUPER_ADMIN" && existing.branch !== session.branch)) {
      return NextResponse.json({ error: "Engineer not found in this branch" }, { status: 404 });
    }

    const engineer = await prisma.engineer.update({
      where: { id },
      data: { isDeleted: true }
    });
    
    return NextResponse.json(engineer);
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete engineer" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Managers only." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: "Engineer ID is required" }, { status: 400 });
    }

    const existing = await prisma.engineer.findUnique({
      where: { id }
    });
    if (!existing || (session.role !== "SUPER_ADMIN" && existing.branch !== session.branch)) {
      return NextResponse.json({ error: "Engineer not found in this branch" }, { status: 404 });
    }

    const data = await request.json();
    const engineer = await prisma.engineer.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        address: data.address,
      }
    });

    return NextResponse.json(engineer);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update engineer" }, { status: 500 });
  }
}
