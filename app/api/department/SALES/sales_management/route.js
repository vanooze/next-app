import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";

export async function GET(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }
    const rows = await executeQuery(
      "SELECT * FROM sales_management WHERE deleted = 0"
    );
    const tasks = rows.map((r) => ({
      id: r.id,
      clientId: r.client_id,
      clientName: r.client_name,
      projectDesc: r.proj_desc,
      dateReceived: r.date_received,
      sirMJH: r.sir_mjh,
      salesPersonnel: r.sales_personnel,
      notes: r.notes,
      status: r.status,
      dateAwarded: r.date_awarded,
    }));
    return Response.json(tasks);
  } catch (error) {
    console.error("API Error: ", error);
    return Response.json({ error: "Failed to fetch table" }, { status: 500 });
  }
}
