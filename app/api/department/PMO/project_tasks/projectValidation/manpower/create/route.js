import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      projectId,
      assignedDate,
      pic = "",
      pmo = "",
      technical = "",
      freelance = "",
    } = body;

    if (!projectId || !assignedDate) {
      return NextResponse.json(
        { success: false, error: "Missing project ID or assigned date" },
        { status: 400 }
      );
    }

    const existing = await executeQuery(
      `SELECT id FROM man_power WHERE project_id = ? AND assigned_date = ?`,
      [projectId, assignedDate]
    );

    const params = [
      pic.trim(),
      pmo.trim(),
      freelance.trim(),
      technical.trim(),
      projectId,
      assignedDate,
    ];

    if (existing.length > 0) {
      const updateQuery = `
        UPDATE man_power 
        SET pic = ?, pmo = ?, freelance = ?, technical = ?, status = 1
        WHERE project_id = ? AND assigned_date = ?
      `;
      const result = await executeQuery(updateQuery, params);
      return NextResponse.json({ success: true, updated: true, result });
    } else {
      const insertQuery = `
        INSERT INTO man_power 
          (pic, pmo, freelance, technical, project_id, assigned_date, status)
        VALUES (?, ?, ?, ?, ?, ?, 1)
      `;
      const result = await executeQuery(insertQuery, params);
      return NextResponse.json({ success: true, created: true, result });
    }
  } catch (err) {
    console.error("Error creating/updating manpower:", err);
    return NextResponse.json(
      { success: false, error: "Failed to create or update manpower" },
      { status: 500 }
    );
  }
}
