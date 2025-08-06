import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";
import { nanoid } from "nanoid";

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { projectId, startDate, endDate, createdAt } = body;

    if (!projectId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Normalize date and status
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    today.setHours(0, 0, 0, 0);

    let status = "Close";
    if (today >= start && today <= end) {
      status = "Open";
    } else if (today > end) {
      status = "Expired";
    }

    const token = nanoid(24);
    const formattedCreatedAt =
      createdAt ?? new Date().toISOString().slice(0, 10);

    // Check if project_id already exists
    const existing = await executeQuery(
      `SELECT id FROM contract WHERE project_id = ? LIMIT 1`,
      [projectId]
    );

    if (existing.length > 0) {
      // Update if exists
      await executeQuery(
        `
        UPDATE contract
        SET 
          link_token = ?,
          start_date = ?,
          end_date = ?,
          created_at = ?,
          status = ?,
          type = ?
        WHERE project_id = ?
        `,
        [token, startDate, endDate, formattedCreatedAt, status, "1", projectId]
      );
    } else {
      // Insert if new
      await executeQuery(
        `
        INSERT INTO contract (
          project_id,
          link_token,
          start_date,
          end_date,
          created_at,
          status,
          type
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [projectId, token, startDate, endDate, formattedCreatedAt, status, "1"]
      );
    }

    return NextResponse.json({ token, updated: existing.length > 0 });
  } catch (error) {
    console.error("Upsert logic failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
