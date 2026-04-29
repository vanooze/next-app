import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  try {
    const templateId = params.id;
    const { employeeId } = await req.json();

    if (!employeeId) {
      return NextResponse.json(
        { error: "Missing employeeId" },
        { status: 400 },
      );
    }

    await executeQuery(`DELETE FROM kra_scores_table_hr WHERE user_id = ?`, [
      employeeId,
    ]);

    // Fetch the template
    const templateRows = await executeQuery(
      `SELECT * FROM kra_table_template_hr WHERE id = ?`,
      [templateId],
    );

    if (!templateRows.length) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );
    }

    const template = templateRows[0];
    const tableIds = JSON.parse(template.table_id);

    if (!tableIds.length) {
      return NextResponse.json(
        { error: "Template has no table IDs" },
        { status: 400 },
      );
    }

    // Fetch KRA details from kra_scores_table based on template IDs
    const kraRows = await executeQuery(
      `SELECT kra, kpi, achievement, weight, excellent, very_good, good, need_improvements, poor
       FROM kra_scores_table_hr
       WHERE id IN (${tableIds.map(() => "?").join(",")})`,
      tableIds,
    );

    if (!kraRows.length) {
      return NextResponse.json(
        { error: "No KRA rows found for this template" },
        { status: 404 },
      );
    }

    // Insert KRA rows for selected employee
    const insertQueries = kraRows.map((row) =>
      executeQuery(
        `INSERT INTO kra_scores_table_hr
         (user_id, kra, kpi, achievement, weight, excellent, very_good, good, need_improvements, poor, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          employeeId, // set new user_id
          row.kra,
          row.kpi,
          row.achievement,
          row.weight,
          row.excellent,
          row.very_good,
          row.good,
          row.need_improvements,
          row.poor,
          new Date().toISOString(),
        ],
      ),
    );

    await Promise.all(insertQueries);

    return NextResponse.json({
      success: true,
      message: "Template applied successfully",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to apply template" },
      { status: 500 },
    );
  }
}
