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
      `SELECT * FROM reports WHERE project_id = ?`,
      [projectId]
    );

    if (existing.length > 0) {
      await executeQuery(
        `UPDATE reports SET assigned_personnel = ? WHERE project_id = ?`,
        [assignedPersonnel, projectId]
      );

      return NextResponse.json({
        success: true,
        message: "Project Turn Over updated",
      });
    } else {
      const result = await executeQuery(
        `INSERT INTO reports (project_id, assigned_personnel) VALUES (?, ?)`,
        [projectId, assignedPersonnel]
      );

      return NextResponse.json({
        success: true,
        message: "Reports created",
        insertId: result.insertId,
      });
    }
  } catch (err) {
    console.error("Error saving Reports:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save Reports" },
      { status: 500 }
    );
  }
}
