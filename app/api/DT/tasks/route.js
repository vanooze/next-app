import { executeQuery } from "@/app/lib/db";

export async function GET() {
  try {
    const rows = await executeQuery("SELECT * FROM design_activity");
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
