import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const ids = searchParams.getAll("id");
    const user = await getUserFromToken(req);
    // if (!user || !user.department) {
    //   return NextResponse.json(
    //     { error: "Unauthorized access" },
    //     { status: 403 }
    //   );
    // }

    if (!ids || ids.length === 0) {
      return NextResponse.json({ error: "No id(s) provided" }, { status: 400 });
    }

    const placeholders = ids.map(() => "?").join(",");
    const rows = await executeQuery(
      `SELECT * FROM design_activity WHERE deleted = 0 AND id IN (${placeholders})`,
      ids
    );

    const tasks = rows.map((r) => ({
      id: r.id,
      clientName: r.client_name,
      projectDesc: r.proj_desc,
      dateReceived: r.date_received,
      salesPersonnel: r.sales_personnel,
      systemDiagram: r.eboq,
      eBoqDate: r.eboq_date,
      structuralBoq: r.sboq,
      sBoqDate: r.sboq_date,
      sirME: r.sir_me,
      sirMJH: r.sir_mjh,
      status: r.status,
    }));

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("API Error: ", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
