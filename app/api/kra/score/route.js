import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";

/** GET existing score */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const tableId = searchParams.get("tableId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (!tableId || !month || !year) {
      return NextResponse.json(null);
    }

    const rows = await executeQuery(
      `SELECT id, rating, points, total, approved_by, approved_at
       FROM kra_scores
       WHERE table_id = ?
         AND month = ?
         AND year = ?
         AND deleted = 0
       LIMIT 1`,
      [tableId, month, year],
    );

    return NextResponse.json(rows[0] || null);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch score" },
      { status: 500 },
    );
  }
}

/** CREATE or UPDATE score */
export async function POST(req) {
  try {
    const body = await req.json();
    const { table_id, user_id, date, month, year, rating, points, total } =
      body;

    if (!table_id || !user_id || !rating || !month || !year) {
      return NextResponse.json(
        { error: "table_id, user_id, month, year, and rating are required" },
        { status: 400 },
      );
    }

    // Check if a score already exists
    const existing = await executeQuery(
      `SELECT id, approved_at FROM kra_scores
       WHERE table_id = ? AND user_id = ? AND month = ? AND year = ? AND deleted = 0
       LIMIT 1`,
      [table_id, user_id, month, year],
    );

    if (existing.length > 0) {
      const row = existing[0];
      if (row.approved_at) {
        return NextResponse.json(
          { error: "Cannot edit an approved score" },
          { status: 403 },
        );
      }

      await executeQuery(
        `UPDATE kra_scores
         SET rating = ?, points = ?, total = ?
         WHERE id = ?`,
        [rating, points, total, row.id],
      );

      return NextResponse.json({
        success: true,
        message: "Score updated successfully",
      });
    }

    // INSERT new score
    await executeQuery(
      `INSERT INTO kra_scores
       (table_id, user_id, date_created, month, year, rating, points, total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [table_id, user_id, date, month, year, rating, points, total],
    );

    return NextResponse.json({
      success: true,
      message: "Score created successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to save score" },
      { status: 500 },
    );
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { tableId, rating, points, total, approverName, approvedAt } = body;

    if (!tableId || !approverName?.trim() || !approvedAt) {
      return NextResponse.json(
        { error: "tableId, approverName, and approvedAt are required" },
        { status: 400 },
      );
    }

    const existing = await executeQuery(
      `SELECT id FROM kra_scores
       WHERE table_id = ? AND deleted = 0
       LIMIT 1`,
      [tableId],
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "No score found to approve" },
        { status: 404 },
      );
    }

    await executeQuery(
      `UPDATE kra_scores
       SET approved_by = ?, approved_at = ?
       WHERE id = ?`,
      [approverName.trim(), approvedAt, existing[0].id],
    );

    return NextResponse.json({
      success: true,
      message: "Score approved successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to approve score" },
      { status: 500 },
    );
  }
}
