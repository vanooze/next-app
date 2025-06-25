import { executeQuery } from "@/app/lib/eform";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";

export async function GET(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department || !user.department.includes("PMO")) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }
    const rows = await executeQuery(`
  SELECT
    idkey, 
    id,
    ctrlnmbr,
    customer,
    contactperson,
    sysconsultant,
    date,
    CASE 
        WHEN (accountingapprovedbystatus = 1 
        AND accountingapprovedbystatus IS NOT NULL) 
        AND (accountingapprovedby2status = 1 
        AND accountingapprovedby2status IS NOT NULL)
        THEN 'Approved'
        ELSE 'Pending'
    END AS status
  FROM so
  WHERE project = 'PROJECT'
`);

    const tasks = rows.map((r) => ({
      id: r.id,
      idkey: r.idkey,
      soNumber: r.ctrlnmbr,
      customer: r.customer,
      contactPerson: r.contactperson,
      sales: r.sysconsultant,
      date: r.date,
      status: r.status,
    }));
    return Response.json(tasks);
  } catch (error) {
    console.error("API Error: ", error);
    return Response.json({ error: "Failed to fetch table" }, { status: 500 });
  }
}
