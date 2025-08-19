import { executeQuery } from "@/app/lib/db";
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
      id,
      po_date,
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
      requester
      FROM po_monitoring
      WHERE status = "1"
      ${id ? "AND id = ?" : ""}
    `,
      id ? [id] : []
    );

    const items = rows.map((r) => ({
      id: r.id,
      poDate: r.po_date,
      poNumber: r.po_number,
      supplier: r.supplier,
      items: r.items,
      qty: r.qty,
      uom: r.uom,
      price: r.price,
      total: r.total,
      terms: r.terms,
      poStatus: r.po_status,
      remarks: r.remarks,
      purpose: r.purpose,
      requester: r.requester,
    }));

    return NextResponse.json(id ? items[0] : items);
  } catch (error) {
    console.error("API Error: ", error);
    return NextResponse.json(
      { error: "Failed to fetch table" },
      { status: 500 }
    );
  }
}
