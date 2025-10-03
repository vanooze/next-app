import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");

    if (!projectId) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    let query = "SELECT * FROM boq_items";
    const values = [];
    const conditions = [];

    if (projectId) {
      conditions.push("project_id = ?");
      values.push(projectId);
    }
    if (category) {
      conditions.push("category = ?");
      values.push(category);
    }
    if (subcategory) {
      conditions.push("subcategory = ?");
      values.push(subcategory);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    // ✅ Pass query and values as separate arguments
    const rows = await executeQuery(query, values);

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const items = Array.isArray(body) ? body : [body];

    if (!items.length) {
      return NextResponse.json(
        { success: false, message: "No items to insert" },
        { status: 400 }
      );
    }

    const grouped = items.reduce((acc, item) => {
      if (!item.projectId) return acc;
      if (!acc[item.projectId]) acc[item.projectId] = [];
      acc[item.projectId].push(item);
      return acc;
    }, {});

    let totalInserted = 0;

    for (const [projectId, groupItems] of Object.entries(grouped)) {
      await executeQuery(`DELETE FROM boq_items WHERE project_id = ?`, [
        projectId,
      ]);

      const placeholders = groupItems.map(() => "(?,?,?,?,?,?,?,?)").join(",");
      const values = groupItems.flatMap((item) => [
        projectId,
        item.category,
        item.subcategory || "",
        item.brand || "",
        item.description || "",
        item.unit || "",
        item.qty ?? "",
        item.remarks || "",
      ]);

      const query = `
        INSERT INTO boq_items
          (project_id, category, subcategory, brand, description, unit, qty, remarks)
        VALUES ${placeholders}
      `;

      console.log("🔹 Processing projectId:", projectId);
      console.log("Insert query:", query);
      console.log("Insert values:", values);

      const insRes = await executeQuery(query, values);
      totalInserted += insRes.affectedRows || 0;
    }

    return NextResponse.json({
      success: true,
      message: `${totalInserted} items saved successfully across ${
        Object.keys(grouped).length
      } project(s)`,
    });
  } catch (error) {
    console.error("❌ BOQ_items error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
