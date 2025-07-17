import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);

  const name = searchParams.get("name");
  const projectIdStr = searchParams.get("projectId");
  const table = searchParams.get("table");
  const action = searchParams.get("action");

  // Ensure all parameters are present
  if (!name || !projectIdStr || !table || !action) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  // Convert projectId to number
  const projectId = parseInt(projectIdStr);
  if (isNaN(projectId)) {
    return NextResponse.json({ error: "Invalid projectId" }, { status: 400 });
  }

  try {
    const query = `
      UPDATE activity_logs
      SET deleted = 1
      WHERE name = ? AND table_name = ? AND record_id = ? AND action = ?
    `;

    await executeQuery({
      query,
      values: [name, table, projectId, action],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Failed to soft delete notification:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
