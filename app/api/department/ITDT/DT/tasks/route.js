import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";

export async function GET(req) {
  try {
    // const user = await getUserFromToken(req);
    // if (!user || !user.department) {
    //   return NextResponse.json(
    //     { error: "Unauthorized access" },
    //     { status: 403 }
    //   );
    // }
    const rows = await executeQuery(
      "SELECT * FROM design_activity WHERE deleted = 0"
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
    return Response.json(tasks);
  } catch (error) {
    console.error("API Error: ", error);
    return Response.json({ error: "Failed to fetch table" }, { status: 500 });
  }
}
