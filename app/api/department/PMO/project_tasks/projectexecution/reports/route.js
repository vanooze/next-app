import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";

export async function GET(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("project_id");

    if (!projectId) {
      return NextResponse.json(
        { error: "Missing project_id" },
        { status: 400 }
      );
    }

    const rows = await executeQuery(
      `
      SELECT 
        id,
        project_id,
        date,
        remarks,
        personnel,
        attachment_name,
        attachment_type,
        note,
        note_personnel
      FROM reporting
      WHERE project_id = ?
      ORDER BY date DESC
      `,
      [projectId]
    );

    const reports = rows.map((r) => ({
      id: r.id,
      project_id: r.project_id,
      report_date: r.date,
      personnel: r.personnel,
      remarks: r.remarks,
      attachment_name: r.attachment_name || "",
      attachment_type: r.attachment_type || "",
      note: r.note,
      note_personnel: r.note_personnel,
    }));

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Fetch reports error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
