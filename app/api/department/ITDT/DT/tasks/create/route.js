import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department || !user.department.includes("Design")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }
    const body = await req.json();

    const {
      clientName,
      projectDesc,
      dateReceived,
      salesPersonnel,
      eboq,
      eboqdate,
      sboq,
      sboqdate,
      sirME,
      sirMJH,
      status,
    } = body;

    const query = `INSERT INTO design_activity 
    (client_name, 
    proj_desc, 
    date_received, 
    sales_personnel, 
    eboq, 
    eboq_date, 
    sboq, 
    sboq_date, 
    sir_me, 
    sir_mjh, 
    status) 
    VALUES 
    (? , ? , ? , ? , ? , ? , ? , ? , ? , ? , ? )`;

    const result = await executeQuery(query, [
      clientName,
      projectDesc,
      dateReceived,
      salesPersonnel,
      eboq,
      eboqdate,
      sboq,
      sboqdate,
      sirME,
      sirMJH,
      status,
    ]);

    return NextResponse.json({ success: true, insertId: result.insertId });
  } catch (err) {
    console.error("Error creating task: ", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create task",
      },
      { status: 500 }
    );
  }
}
