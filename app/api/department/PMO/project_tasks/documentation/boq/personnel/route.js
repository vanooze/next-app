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

    const boqType = type || 1;

    const existing = await executeQuery(
      `SELECT * FROM boq WHERE project_id = ? AND type= ?`,
      [projectId, boqType]
    );

    if (existing.length > 0) {
      await executeQuery(
        `UPDATE boq SET assigned_personnel = ?, WHERE project_id = ? AND type = ? `,
        [assignedPersonnel, projectId, boqType]
      );

      return NextResponse.json({
        success: true,
        message: "Project Turn Over updated",
      });
    } else {
      const result = await executeQuery(
        `INSERT INTO boq (project_id, assigned_personnel, type) VALUES (?, ?, ?)`,
        [projectId, projectName, assignedPersonnel, boqType]
      );

      return NextResponse.json({
        success: true,
        message: "boq created",
        insertId: result.insertId,
      });
    }
  } catch (err) {
    console.error("Error saving boq:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save boq" },
      { status: 500 }
    );
  }
}
