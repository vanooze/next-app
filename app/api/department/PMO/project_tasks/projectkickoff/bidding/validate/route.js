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
    const token = searchParams.get("token");

    const rows = await executeQuery(
      `
      SELECT
        c.id,
        c.project_id,
        c.link_token,
        c.start_date,
        c.end_date,
        c.attachment_name,
        c.attachment_type,
        c.created_at,
        c.status,
        c.type,
        p.description
      FROM contract c
      LEFT JOIN projects_manual p ON p.project_id = c.project_id
      ${token ? "WHERE c.link_token = ?" : ""}
      `,
      token ? [token] : []
    );

    const tasks = rows.map((r) => ({
      id: r.id,
      projectId: r.project_id,
      token: r.link_token,
      startDate: r.start_date,
      endDate: r.end_date,
      attachmentName: r.attachment_name,
      attachmentType: r.attachment_type,
      createdAt: r.created_at,
      type: r.type,
      status: r.status,
      projectName: r.description || "Unknown",
    }));

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("API Error: ", error);
    return NextResponse.json({ error: "Failed to Validate" }, { status: 500 });
  }
}
