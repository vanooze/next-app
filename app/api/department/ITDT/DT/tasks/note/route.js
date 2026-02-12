import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const projId = url.searchParams.get("projId");
    if (!projId) return new Response("Missing projId", { status: 400 });

    const rows = await executeQuery(
      "SELECT * FROM design_project_note WHERE proj_id = ? AND deleted = 0 ORDER BY date ASC",
      [projId],
    );

    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to fetch notes" }), {
      status: 500,
    });
  }
}

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projId, note, createdBy, date } = await req.json();

    if (!projId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 },
      );
    }

    // Update note in DB
    await executeQuery(
      `
      INSERT INTO design_project_note
      (proj_id, note, created_by, date) VALUES (?,?,?,?)
      `,
      [projId, note, createdBy, date],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save note API error:", error);

    return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
  }
}
