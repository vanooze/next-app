import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { projectId, createdBy, items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "No items provided" },
        { status: 400 }
      );
    }

    const values = items.map((item) => [
      projectId,
      createdBy,
      item.name,
      item.price,
    ]);

    const placeholders = values.map(() => "(?, ?, ?, ?)").join(", ");

    const query = `
      INSERT INTO budget 
        (project_id, created_by, item_name, price)
      VALUES ${placeholders}
    `;

    const flatValues = values.flat();

    await executeQuery(query, flatValues);

    return NextResponse.json({ success: true, message: "Budget items saved" });
  } catch (err) {
    console.error("Error saving budget items:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
