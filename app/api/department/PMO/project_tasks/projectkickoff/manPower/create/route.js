import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      projectId = null,
      personInCharge = "",
      pmoOfficers = "",
      technicals = "",
      freelances = "",
    } = body;

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: "Missing project ID" },
        { status: 400 }
      );
    }

    // Check if a record already exists for this project
    const existing = await executeQuery(
      `SELECT id FROM man_power WHERE project_id = ?`,
      [projectId]
    );

    if (existing.length > 0) {
      const updateQuery = `
        UPDATE man_power SET
          pic = ?, 
          pmo = ?, 
          freelance = ?, 
          technical = ?,
          status = '1'
        WHERE project_id = ?
      `;
      const result = await executeQuery(updateQuery, [
        personInCharge,
        pmoOfficers,
        freelances,
        technicals,
        projectId,
      ]);

      return NextResponse.json({ success: true, updated: true, result });
    } else {
      // No record — perform insert
      const insertQuery = `
        INSERT INTO man_power 
          (project_id, pic, pmo, freelance, technical, status)
        VALUES (?, ?, ?, ?, ?, '1')
      `;
      const result = await executeQuery(insertQuery, [
        projectId,
        personInCharge,
        pmoOfficers,
        freelances,
        technicals,
      ]);

      return NextResponse.json({ success: true, created: true, result });
    }
  } catch (err) {
    console.error("Error creating or updating task: ", err);
    return NextResponse.json(
      { success: false, error: "Failed to create or update task" },
      { status: 500 }
    );
  }
}
