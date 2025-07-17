import { executeQuery } from "@/app/lib/eform";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";

export async function GET(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const rows = await executeQuery(
      `
      SELECT
        idkey, 
        id,
        ctrlnmbr,
        customer,
        contactperson,
        sysconsultant,
        date,
        access,
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
      ${id ? "AND idkey = ?" : ""}
    `,
      id ? [id] : []
    );

    const tasks = rows.map((r) => ({
      id: r.id,
      idkey: r.idkey,
      soNumber: r.ctrlnmbr,
      customer: r.customer,
      contactPerson: r.contactperson,
      sales: r.sysconsultant,
      date: r.date,
      status: r.status,
      access: r.access,
    }));

    return NextResponse.json(id ? tasks[0] : tasks);
  } catch (error) {
    console.error("API Error: ", error);
    return NextResponse.json(
      { error: "Failed to fetch table" },
      { status: 500 }
    );
  }
}
