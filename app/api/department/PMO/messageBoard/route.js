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
        id,
        project_id,
        message,
        date
      FROM message_board
      ${projectId ? "WHERE project_id = ?" : ""}
      ORDER BY id DESC
    `;

    const rows = await executeQuery(query, projectId ? [projectId] : []);

    const data = rows.map((r) => ({
      id: r.id,
      projectId: r.project_id,
      message: r.message,
      date: r.date,
    }));

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("API Error (GET):", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

//
// POST message
//
export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const { projectId, message } = await req.json();

    if (!projectId || !message.trim()) {
      return NextResponse.json(
        { error: "Missing projectId or message" },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split("T")[0];

    const result = await executeQuery(
      "INSERT INTO message_board (project_id, message, date) VALUES (?, ?, ?)",
      [projectId, message, today]
    );

    return NextResponse.json({
      id: result.insertId,
      projectId,
      message: message,
      date: today,
    });
  } catch (error) {
    console.error("Internal API Error:", error);
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }
}
