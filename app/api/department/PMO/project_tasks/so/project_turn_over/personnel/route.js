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
    const { projectId, assignedPersonnel } = body;

    if (!projectId || !assignedPersonnel) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existing = await executeQuery(
      `SELECT * FROM project_turn_over WHERE project_id = ?`,
      [projectId]
    );

    if (existing.length > 0) {
      await executeQuery(
        `UPDATE project_turn_over SET assigned_personnel = ? WHERE project_id = ?`,
        [assignedPersonnel, projectId]
      );

      return NextResponse.json({
        success: true,
        message: "Project Turn Over updated",
      });
    } else {
      const result = await executeQuery(
        `INSERT INTO project_turn_over (project_id, assigned_personnel) VALUES (?, ?)`,
        [projectId, assignedPersonnel]
      );

      return NextResponse.json({
        success: true,
        message: "Project Turn Over created",
        insertId: result.insertId,
      });
    }
  } catch (err) {
    console.error("Error saving Project Turn Over:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save Project Turn Over" },
      { status: 500 }
    );
  }
}
