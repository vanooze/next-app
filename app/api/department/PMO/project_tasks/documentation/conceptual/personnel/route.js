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
    const { projectId, projectName, assignedPersonnel, type } = body;

    if (!projectId || !projectName || !assignedPersonnel) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const conceptualType = type || 1;

    const existing = await executeQuery(
      `SELECT * FROM conceptual WHERE project_id = ? AND type= ?`,
      [projectId, conceptualType]
    );

    if (existing.length > 0) {
      await executeQuery(
        `UPDATE conceptual SET assigned_personnel = ? WHERE project_id = ? AND type= ?`,
        [assignedPersonnel, projectId, conceptualType]
      );

      return NextResponse.json({
        success: true,
        message: "Project Turn Over updated",
      });
    } else {
      const result = await executeQuery(
        `INSERT INTO conceptual (project_id, project_name, assigned_personnel, type) VALUES (?, ?, ?,?)`,
        [projectId, projectName, assignedPersonnel, conceptualType]
      );

      return NextResponse.json({
        success: true,
        message: "conceptual created",
        insertId: result.insertId,
      });
    }
  } catch (err) {
    console.error("Error saving conceptual:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save conceptual" },
      { status: 500 }
    );
  }
}
