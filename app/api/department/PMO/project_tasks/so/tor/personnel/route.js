import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { projectId, projectName, assignedTor } = body;

    if (!projectId || !projectName || !assignedTor) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
    const existing = await executeQuery(
      `SELECT * FROM tor WHERE project_id = ?`,
      [projectId]
    );

    if (existing.length > 0) {
      await executeQuery(
        `UPDATE tor SET assigned_tor = ? WHERE project_id = ?`,
        [assignedTor, projectId]
      );

      return NextResponse.json({ success: true, message: "TOR updated" });
    } else {
      const result = await executeQuery(
        `INSERT INTO tor (project_id, assigned_tor) VALUES (?, ?)`,
        [projectId, projectName, assignedTor]
      );

      return NextResponse.json({
        success: true,
        message: "TOR created",
        insertId: result.insertId,
      });
    }
  } catch (err) {
    console.error("Error saving TOR:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save TOR" },
      { status: 500 }
    );
  }
}
