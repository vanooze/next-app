import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }
    const body = await req.json();

    const {
      poDate,
      poNumber,
      supplier,
      items,
      qty,
      uom,
      price,
      total,
      terms,
      poStatus,
      remarks,
      purpose,
      requester,
    } = body;

    const query = `INSERT INTO po_monitoring 
    ( po_date,
      po_number,
      supplier,
      items,
      qty,
      uom,
      price,
      total,
      terms,
      po_status,
      remarks,
      purpose,
      requester) 
    VALUES 
    (?,?,?,?,?,?,?,?,?,?,?,?,? )`;

    const result = await executeQuery(query, [
      poDate,
      poNumber,
      supplier,
      items,
      qty,
      uom,
      price,
      total,
      terms,
      poStatus,
      remarks,
      purpose,
      requester,
    ]);

    return NextResponse.json({ success: true, insertId: result.insertId });
  } catch (err) {
    console.error("Error creating item: ", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create item",
      },
      { status: 500 }
    );
  }
}
