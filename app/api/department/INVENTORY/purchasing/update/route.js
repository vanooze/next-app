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
      id,
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

    if (!id) {
      return NextResponse.json(
        { success: false, error: "item ID is required for update" },
        { status: 400 }
      );
    }

    const query = `
      UPDATE po_monitoring SET
        po_date = ?,
      po_number= ?,
      supplier= ?,
      items= ?,
      qty= ?,
      uom= ?,
      price= ?,
      total= ?,
      terms= ?,
      po_status= ?,
      remarks= ?,
      purpose= ?,
      requester= ?
      WHERE id = ?
    `;

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
      id,
    ]);

    return NextResponse.json({
      success: true,
      affectedRows: result.affectedRows,
    });
  } catch (err) {
    console.error("Error updating item: ", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update item",
      },
      { status: 500 }
    );
  }
}
