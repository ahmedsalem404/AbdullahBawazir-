import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // Enforce branch segregation: ADMIN must match branch. SUPER_ADMIN is exempt.
    const existing = await prisma.customer.findUnique({
      where: { id }
    });
    if (!existing || (session.role !== "SUPER_ADMIN" && existing.branch !== session.branch)) {
      return NextResponse.json({ error: "Customer not found in this branch" }, { status: 404 });
    }

    const data = await request.json();
    const customer = await prisma.customer.update({
      where: { id },
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
        currency: data.currency,
        payment_method: data.payment_method,
        transfer_type: data.transfer_type || null,
        is_not_worked_on: data.is_not_worked_on ?? false
      }
    });
    return NextResponse.json(customer);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role-based restriction: Only SUPER_ADMIN and ADMIN can delete. WORKER is blocked.
    if (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Managers only." }, { status: 403 });
    }

    const { id } = await params;

    // Enforce branch segregation: ADMIN must match branch. SUPER_ADMIN is exempt.
    const existing = await prisma.customer.findUnique({
      where: { id }
    });
    if (!existing || (session.role !== "SUPER_ADMIN" && existing.branch !== session.branch)) {
      return NextResponse.json({ error: "Customer not found in this branch" }, { status: 404 });
    }

    await prisma.customer.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}
