import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";
export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const user = await getUserFromToken(req);
    // if (!user || !user.department) {
    //   return NextResponse.json(
    //     { error: "Unauthorized access" },
    //     { status: 403 }
    //   );
    // }
    const rows = await executeQuery(
      "SELECT * FROM repair_activity WHERE deleted = 0",
    );
    const tasks = rows.map((r) => ({
      id: r.id,
      clientName: r.client_name,
      description: r.description,
      date: r.date,
      personnel: r.assigned_personnel,
      status: r.status,
      unit: r.unit,
      severity: r.severity,
      completion: r.completion,
      files: r.file,
    }));
    return Response.json(tasks);
  } catch (error) {
    console.error("API Error: ", error);
    return Response.json({ error: "Failed to fetch table" }, { status: 500 });
  }
}
