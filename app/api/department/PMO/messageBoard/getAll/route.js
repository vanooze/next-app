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
    const projectId = searchParams.get("projectId");

    const query = `
      SELECT
        m.id,
        m.project_id,
        m.message,
        m.date,
        p.description AS project_description
      FROM message_board m
      LEFT JOIN projects_manual p ON m.project_id = p.project_id
      ${projectId ? "WHERE m.project_id = ?" : ""}
      ORDER BY m.id DESC
    `;

    const rows = await executeQuery(query, projectId ? [projectId] : []);

    const data = rows.map((r) => ({
      id: r.id,
      projectId: r.project_id,
      message: r.message,
      date: r.date,
      projectDescription: r.project_description || null,
    }));

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Enternal Server Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
