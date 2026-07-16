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
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "6");
    const isManager = searchParams.get("isManager") === "true";
    const onlyUnderWork = searchParams.get("onlyUnderWork") === "true";

    const where: any = {
      branch: session.branch
    };
    
    if (onlyUnderWork) {
      const matching = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM customers 
        WHERE branch = ${session.branch} 
          AND is_not_worked_on = false 
          AND (required_amount = 0 OR paid_amount < (required_amount - injectors_amount))
      `;
      const ids = matching.map(c => c.id);
      where.id = { in: ids };
    } else {
      // Bypass date filter if a search query is provided
      if (start && end && !search) {
        where.createdAt = {
          gte: new Date(start),
          lte: new Date(end)
        };
      }
    }

    if (search) {
      where.OR = [
        { customer_name: { contains: search } },
        { phone: { contains: search } }
      ];
    }

    const [customers, totalRows] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: { engineer: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.customer.count({ where })
    ]);

    const financialBreakdown = {
      Cash: { YER: 0, SAR: 0, USD: 0 },
      Transfer: { YER: 0, SAR: 0, USD: 0 },
      Manager_Hand: { YER: 0, SAR: 0, USD: 0 }
    };

    if (isManager && start && end) {
      const aggregates = await prisma.customer.groupBy({
        by: ["payment_method", "currency"],
        where: {
          branch: session.branch,
          is_not_worked_on: false,
          createdAt: {
            gte: new Date(start),
            lte: new Date(end)
          }
        },
        _sum: {
          paid_amount: true,
          injectors_amount: true
        }
      });

      aggregates.forEach(agg => {
        const method = agg.payment_method as "Cash" | "Transfer" | "Manager_Hand";
        const curr = agg.currency as "YER" | "SAR" | "USD";
        const paid = agg._sum.paid_amount || 0;
        const injectors = agg._sum.injectors_amount || 0;
        const net = Math.max(paid - injectors, 0);

        if (financialBreakdown[method] && financialBreakdown[method][curr] !== undefined) {
          financialBreakdown[method][curr] = net;
        }
      });
    }

    // Map response to match frontend expectations
    const formattedCustomers = customers.map(c => {
      const siteRequired = Math.max((c.required_amount || 0) - (c.injectors_amount || 0), 0);
      const rem = Math.max(siteRequired - (c.paid_amount || 0), 0);
      
      let status = "قيد العمل";
      if (c.is_not_worked_on) {
        status = "لم يتم العمل";
      } else if (c.required_amount <= 0) {
        status = "قيد العمل";
      } else if (rem <= 0) {
        status = "مدفوع";
      }

      return {
        ...c,
        created_at: c.createdAt,
        engineer_name: c.engineer?.name || null,
        remaining_amount: rem,
        status: status
      };
    });

    return NextResponse.json({
      data: formattedCustomers,
      count: totalRows,
      financialBreakdown
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const customer = await prisma.customer.create({
      data: {
        customer_name: data.customer_name,
        phone: data.phone,
        car_type: data.car_type,
        car_year: data.car_year,
        engineer_id: data.engineer_id || null,
        work_notes: data.work_notes,
        required_amount: data.required_amount,
        paid_amount: data.paid_amount,
        injectors_amount: data.injectors_amount || 0,
        currency: data.currency || "SAR",
        payment_method: data.payment_method || "Cash",
        transfer_type: data.transfer_type || null,
        is_not_worked_on: data.is_not_worked_on ?? false,
        branch: session.branch,
        createdBy: data.created_by
      }
    });
    return NextResponse.json(customer);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
