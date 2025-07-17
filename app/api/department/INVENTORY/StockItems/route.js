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
      inventory_id,
      description,
      type,
      subassembly,
      item_class,
      posting_class,
      tax_category,
      default_warehouse,
      base_unit,
      default_price,
      item_status
      ${id ? "WHERE id = ?" : ""}
    `,
      id ? [id] : []
    );

    const items = rows.map((r) => ({
      id: r.id,
      inventoryId: r.inventory_id,
      description: r.description,
      type: r.type,
      subassembly: r.subassembly,
      itemClass: r.item_class,
      taxCategory: r.tax_category,
      defaultWarehouse: r.default_warehouse,
      baseUnit: r.base_unit,
      defaultPrice: r.default_price,
      status: r.item_status,
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
