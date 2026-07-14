import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch all tables
    const [users, engineers, customers, attendances, archivedCustomers] = await Promise.all([
      prisma.profile.findMany(),
      prisma.engineer.findMany(),
      prisma.customer.findMany(),
      prisma.attendance.findMany(),
      prisma.archivedCustomer.findMany(),
    ]);

    let sqlDump = `-- Backup generated on ${new Date().toISOString()}\n`;
    sqlDump += `-- Database: bawazir_db\n\n`;
    sqlDump += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

    // Helper to format values for SQL inserts
    const escapeSQLValue = (val: any): string => {
      if (val === null || val === undefined) return "NULL";
      if (typeof val === "boolean") return val ? "1" : "0";
      if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
      if (typeof val === "number") return val.toString();
      // String escape (single quotes escape as '')
      const escaped = val.toString().replace(/'/g, "''");
      return `'${escaped}'`;
    };

    // 1. Profiles (users)
    sqlDump += `-- Profiles table\nTRUNCATE TABLE \`profiles\`;\n`;
    for (const u of users) {
      const cols = ["id", "username", "password", "full_name", "role", "branch", "isActive", "createdAt"];
      const vals = [u.id, u.username, u.password, u.full_name, u.role, u.branch, u.isActive, u.createdAt];
      sqlDump += `INSERT INTO \`profiles\` (${cols.map(c => `\`${c}\``).join(", ")}) VALUES (${vals.map(escapeSQLValue).join(", ")});\n`;
    }
    sqlDump += `\n`;

    // 2. Engineers
    sqlDump += `-- Engineers table\nTRUNCATE TABLE \`engineers\`;\n`;
    for (const e of engineers) {
      const cols = ["id", "name", "phone", "address", "branch", "isDeleted", "createdAt"];
      const vals = [e.id, e.name, e.phone, e.address, e.branch, e.isDeleted, e.createdAt];
      sqlDump += `INSERT INTO \`engineers\` (${cols.map(c => `\`${c}\``).join(", ")}) VALUES (${vals.map(escapeSQLValue).join(", ")});\n`;
    }
    sqlDump += `\n`;

    // 3. Customers
    sqlDump += `-- Customers table\nTRUNCATE TABLE \`customers\`;\n`;
    for (const c of customers) {
      const cols = [
        "id", "customer_name", "phone", "car_type", "car_year", "engineer_id", 
        "work_notes", "required_amount", "paid_amount", "injectors_amount", 
        "currency", "payment_method", "transfer_type", "is_not_worked_on", 
        "branch", "createdBy", "createdAt"
      ];
      const vals = [
        c.id, c.customer_name, c.phone, c.car_type, c.car_year, c.engineer_id, 
        c.work_notes, c.required_amount, c.paid_amount, c.injectors_amount, 
        c.currency, c.payment_method, c.transfer_type, c.is_not_worked_on, 
        c.branch, c.createdBy, c.createdAt
      ];
      sqlDump += `INSERT INTO \`customers\` (${cols.map(c => `\`${c}\``).join(", ")}) VALUES (${vals.map(escapeSQLValue).join(", ")});\n`;
    }
    sqlDump += `\n`;

    // 4. Attendances
    sqlDump += `-- Attendance table\nTRUNCATE TABLE \`attendance\`;\n`;
    for (const a of attendances) {
      const cols = ["id", "engineer_id", "branch", "date", "time", "createdAt"];
      const vals = [a.id, a.engineer_id, a.branch, a.date, a.time, a.createdAt];
      sqlDump += `INSERT INTO \`attendance\` (${cols.map(c => `\`${c}\``).join(", ")}) VALUES (${vals.map(escapeSQLValue).join(", ")});\n`;
    }
    sqlDump += `\n`;

    // 5. Archived Customers
    sqlDump += `-- Archived Customers table\nTRUNCATE TABLE \`archived_customers\`;\n`;
    for (const ac of archivedCustomers) {
      const cols = [
        "id", "customer_name", "phone", "car_type", "car_year", "engineer_id", "engineer_name",
        "work_notes", "required_amount", "paid_amount", "injectors_amount", 
        "currency", "payment_method", "transfer_type", "is_not_worked_on", 
        "branch", "createdBy", "createdAt", "archivedAt"
      ];
      const vals = [
        ac.id, ac.customer_name, ac.phone, ac.car_type, ac.car_year, ac.engineer_id, ac.engineer_name,
        ac.work_notes, ac.required_amount, ac.paid_amount, ac.injectors_amount, 
        ac.currency, ac.payment_method, ac.transfer_type, ac.is_not_worked_on, 
        ac.branch, ac.createdBy, ac.createdAt, ac.archivedAt
      ];
      sqlDump += `INSERT INTO \`archived_customers\` (${cols.map(c => `\`${c}\``).join(", ")}) VALUES (${vals.map(escapeSQLValue).join(", ")});\n`;
    }
    sqlDump += `\n`;

    sqlDump += `SET FOREIGN_KEY_CHECKS = 1;\n`;

    // Update last backup date in SystemSettings database table
    try {
      await prisma.systemSettings.upsert({
        where: { id: "default" },
        update: { last_backup_date: new Date() },
        create: { id: "default", last_backup_date: new Date() },
      });
    } catch (dbErr) {
      console.error("Failed to update last backup date in settings table", dbErr);
    }

    const headers = new Headers();
    headers.set("Content-Type", "application/sql");
    const dateStr = new Date().toISOString().slice(0, 10);
    headers.set("Content-Disposition", `attachment; filename="bawazir_db_backup_${dateStr}.sql"`);

    return new NextResponse(sqlDump, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error("Backup generation error:", error);
    return NextResponse.json({ error: "Failed to generate backup" }, { status: 500 });
  }
}
