import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET: Retrieve archived records filtered by year, search, and page
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "6");

    if (!year) {
      return NextResponse.json({ error: "Year parameter is required" }, { status: 400 });
    }

    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

    const where: any = {
      createdAt: {
        gte: startOfYear,
        lte: endOfYear,
      },
    };

    if (search) {
      where.OR = [
        { customer_name: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const [archived, count] = await Promise.all([
      prisma.archivedCustomer.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.archivedCustomer.count({ where }),
    ]);

    // Format response to match frontend grid expectations
    const formatted = archived.map(c => {
      const siteRequired = Math.max((c.required_amount || 0) - (c.injectors_amount || 0), 0);
      const rem = Math.max(siteRequired - (c.paid_amount || 0), 0);
      let status = "قيد العمل";
      if (c.is_not_worked_on) {
        status = "لم يتم العمل";
      } else if (rem <= 0) {
        status = "مدفوع";
      }

      return {
        ...c,
        created_at: c.createdAt,
        remaining_amount: rem,
        status,
      };
    });

    return NextResponse.json({ data: formatted, count });
  } catch (error) {
    console.error("Fetch archive error:", error);
    return NextResponse.json({ error: "Failed to fetch archived records" }, { status: 500 });
  }
}

// POST: Execute archiving for a specific year
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { year } = await request.json();
    if (!year) {
      return NextResponse.json({ error: "Year is required" }, { status: 400 });
    }

    const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

    // Fetch all customers matching the year, excluding "لم يتم العمل"
    const customers = await prisma.customer.findMany({
      where: {
        createdAt: {
          lte: endOfYear,
        },
        is_not_worked_on: false,
      },
      include: {
        engineer: true,
      },
    });

    // Filter in memory for completed records only (paid in full)
    const completed = customers.filter(c => {
      const siteRequired = Math.max((c.required_amount || 0) - (c.injectors_amount || 0), 0);
      const remaining = Math.max(siteRequired - (c.paid_amount || 0), 0);
      return remaining <= 0;
    });

    if (completed.length === 0) {
      // Still need to delete any "لم يتم العمل" records for this year if any exist, even if nothing is archived
      await prisma.customer.deleteMany({
        where: {
          createdAt: {
            lte: endOfYear,
          },
          is_not_worked_on: true,
        },
      });

      return NextResponse.json({ 
        success: true, 
        archivedCount: 0, 
        message: `لا توجد فواتير مغلقة ومكتملة للأرشفة في أو قبل عام ${year}. (تم تنظيف فواتير "لم يتم العمل")` 
      });
    }

    // Move to archived table and delete from customers inside a transaction
    await prisma.$transaction([
      prisma.archivedCustomer.createMany({
        data: completed.map(c => ({
          id: c.id,
          customer_name: c.customer_name,
          phone: c.phone,
          car_type: c.car_type,
          car_year: c.car_year,
          engineer_id: c.engineer_id,
          engineer_name: c.engineer?.name || null,
          work_notes: c.work_notes,
          required_amount: c.required_amount,
          paid_amount: c.paid_amount,
          injectors_amount: c.injectors_amount || 0,
          currency: c.currency,
          payment_method: c.payment_method,
          transfer_type: c.transfer_type,
          is_not_worked_on: c.is_not_worked_on,
          branch: c.branch,
          createdBy: c.createdBy,
          createdAt: c.createdAt,
          archivedAt: new Date(),
        })),
      }),
      prisma.customer.deleteMany({
        where: {
          id: {
            in: completed.map(c => c.id),
          },
        },
      }),
      // Delete the "لم يتم العمل" customers from the active table for this period
      prisma.customer.deleteMany({
        where: {
          createdAt: {
            lte: endOfYear,
          },
          is_not_worked_on: true,
        },
      }),
    ]);

    return NextResponse.json({ 
      success: true, 
      archivedCount: completed.length, 
      message: `تم أرشفة ونقل عدد ${completed.length} فاتورة مكتملة لعام ${year} بنجاح! 🎉` 
    });
  } catch (error) {
    console.error("Archive execution error:", error);
    return NextResponse.json({ error: "Failed to execute archiving process" }, { status: 500 });
  }
}
