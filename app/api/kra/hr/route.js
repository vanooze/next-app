import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const url = new URL(req.url);

    const employeeId = url.searchParams.get("employeeId");
    const month = url.searchParams.get("month");
    const year = url.searchParams.get("year");

    if (!employeeId || !month || !year) {
      return NextResponse.json([]);
    }

    const rows = await executeQuery(
      `
      SELECT
        k.*,
        s.rating,
        s.points,
        s.total,
        s.approved_by,
        s.approved_at
      FROM kra_scores_table_hr k
      LEFT JOIN kra_scores_hr s
        ON s.table_id = k.id
        AND s.user_id = ?
        AND s.month = ?
        AND s.year = ?
        AND s.deleted = 0
      WHERE k.deleted = 0
      AND k.user_id = ?
      `,
      [employeeId, month, year, employeeId],
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch KRA data" },
      { status: 500 },
    );
  }
}
