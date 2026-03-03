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
      "SELECT * FROM marketing_activity WHERE deleted = 0",
    );
    const tasks = rows.map((r) => ({
      id: r.id,
      clientName: r.client_name,
      projectDesc: r.proj_desc,
      dateReceived: r.date_received,
      personnel: r.personnel,
      date: r.date,
      file: r.file,
      status: r.status,
    }));
    return Response.json(tasks);
  } catch (error) {
    console.error("API Error: ", error);
    return Response.json({ error: "Failed to fetch table" }, { status: 500 });
  }
}
