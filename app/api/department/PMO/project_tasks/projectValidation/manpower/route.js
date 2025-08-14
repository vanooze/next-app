import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("id");

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: "Missing project ID" },
        { status: 400 }
      );
    }

    const rows = await executeQuery(
      `SELECT assigned_date, pic, pmo, technical, freelance
       FROM man_power
       WHERE project_id = ?
       AND assigned_date IS NOT NULL
       ORDER BY assigned_date DESC`,
      [projectId]
    );

    const formatted = rows.map((row) => ({
      date: row.assigned_date,
      people: {
        pic: row.pic ? row.pic.split(",").map((s) => s.trim()) : [],
        pmo: row.pmo ? row.pmo.split(",").map((s) => s.trim()) : [],
        technical: row.technical
          ? row.technical.split(",").map((s) => s.trim())
          : [],
        freelance: row.freelance
          ? row.freelance.split(",").map((s) => s.trim())
          : [],
      },
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (err) {
    console.error("Error fetching assigned manpower:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch assigned manpower" },
      { status: 500 }
    );
  }
}
