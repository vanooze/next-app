// /api/notification/check-duplicate/route.ts
import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db"; // adjust path as needed

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");
    const action = searchParams.get("action");
    const record_id = searchParams.get("record_id");

    if (!name || !action || !record_id) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const query = `
      SELECT COUNT(*) as count FROM activity_logs
      WHERE name = ? AND action = ? AND record_id = ?
    `;
    const result = await executeQuery(query, [name, action, record_id]);

    const count = Array.isArray(result) ? result[0]?.count || 0 : 0;
    const exists = count > 0;

    return NextResponse.json({ exists });
  } catch (err) {
    console.error("❌ check-duplicate error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
