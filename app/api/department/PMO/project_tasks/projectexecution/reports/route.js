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
        category,
        date,
        time_in,
        time_out,
        activity,
        concern,
        action_taken,
        remarks,
        attachment_name,
        attachment_type
      FROM reporting
      WHERE project_id = ?
      ORDER BY date DESC
      `,
      [projectId]
    );

    const reports = rows.map((r) => ({
      id: r.id,
      projectId: r.project_id,
      category: r.category,
      date: r.date,
      timeIn: r.time_in,
      timeOut: r.time_out,
      activity: r.activity,
      concern: r.concern,
      actionTaken: r.action_taken,
      remarks: r.remarks,
      attachmentName: r.attachment_name,
      attachmentType: r.attachment_type,
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
