import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "super-secret-local-key");

export async function GET(request: NextRequest) {
  const token = request.cookies.get("workshop_session")?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Check if user still exists in DB and select username
    const user = await prisma.profile.findUnique({
      where: { id: payload.id as string },
      select: { id: true, username: true, full_name: true, role: true, isActive: true }
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const safeDecode = (str: string) => {
      try {
        return decodeURIComponent(str).trim();
      } catch (e) {
        return str.trim();
      }
    };

    // Fetch last backup date
    const settings = await prisma.systemSettings.findFirst();
    const last_backup_date = settings?.last_backup_date ? settings.last_backup_date.toISOString() : null;

    return NextResponse.json({
      user: {
        ...user,
        branch: safeDecode((payload.branch as string) || "الحسوة"),
        last_backup_date
      }
    });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
