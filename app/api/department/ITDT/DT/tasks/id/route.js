import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const idParam = searchParams.get("id");
    if (!idParam) {
      return NextResponse.json(
        { error: "At least one id is required" },
        { status: 400 }
      );
    }

    const validIds = idParam
      .split(",")
      .map((id) => id.trim())
      .filter((id) => /^\d+$/.test(id));

    if (validIds.length === 0) {
      return NextResponse.json({ error: "Invalid id format" }, { status: 400 });
    }
    const placeholders = validIds.map(() => "?").join(",");

    const query = `
      SELECT id, client_name, proj_desc, date_received, sales_personnel,
             eboq, eboq_date, sboq, sboq_date, sir_me, sir_mjh, status
      FROM design_activity
      WHERE deleted = 0 AND id IN (${placeholders})
    `;

    const rows = await executeQuery(query, validIds);

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

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks", details: error.message },
      { status: 500 }
    );
  }
}
