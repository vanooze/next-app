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
    const { projectId, assignedPo } = body;

    if (!projectId || !assignedPo) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
    const existing = await executeQuery(
      `SELECT * FROM po WHERE project_id = ? `,
      [projectId]
    );

    if (existing.length > 0) {
      await executeQuery(
        `UPDATE po SET assigned_po = ? WHERE project_id = ? `,
        [assignedPo, projectId]
      );

      return NextResponse.json({ success: true, message: "PO updated" });
    } else {
      const result = await executeQuery(
        `INSERT INTO po (project_id, assigned_po) VALUES (?, ?)`,
        [projectId, assignedPo]
      );

      return NextResponse.json({
        success: true,
        message: "PO created",
        insertId: result.insertId,
      });
    }
  } catch (err) {
    console.error("Error saving PO:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save PO" },
      { status: 500 }
    );
  }
}
