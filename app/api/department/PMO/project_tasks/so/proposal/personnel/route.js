import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department || !user.department.includes("PMO")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { projectId, projectName, assignedPersonnel } = body;

    if (!projectId || !projectName || !assignedPersonnel) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existing = await executeQuery(
      `SELECT * FROM proposal WHERE project_id = ?`,
      [projectId]
    );

    if (existing.length > 0) {
      await executeQuery(
        `UPDATE proposal SET assigned_personnel = ? WHERE project_id = ?`,
        [assignedPersonnel, projectId]
      );

      return NextResponse.json({
        success: true,
        message: "Project Turn Over updated",
      });
    } else {
      const result = await executeQuery(
        `INSERT INTO proposal (project_id, project_name, assigned_personnel) VALUES (?, ?, ?)`,
        [projectId, projectName, assignedPersonnel]
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
