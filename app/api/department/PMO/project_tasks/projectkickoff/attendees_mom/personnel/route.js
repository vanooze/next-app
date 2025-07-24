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
    const { projectId, projectName, assignedPersonnel } = body;

    if (!projectId || !projectName || !assignedPersonnel) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existing = await executeQuery(
      `SELECT * FROM attendees_mom WHERE project_id = ?`,
      [projectId]
    );

    if (existing.length > 0) {
      await executeQuery(
        `UPDATE attendees_mom SET assigned_personnel = ? WHERE project_id = ?`,
        [assignedPersonnel, projectId]
      );

      return NextResponse.json({
        success: true,
        message: "Project Turn Over updated",
      });
    } else {
      const result = await executeQuery(
        `INSERT INTO attendees_mom (project_id, assigned_personnel) VALUES ( ?, ?)`,
        [projectId, projectName, assignedPersonnel]
      );

      return NextResponse.json({
        success: true,
        message: "attendees_mom created",
        insertId: result.insertId,
      });
    }
  } catch (err) {
    console.error("Error saving attendees_mom:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save attendees_mom" },
      { status: 500 }
    );
  }
}
