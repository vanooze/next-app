import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";

// GET
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  const rows = await executeQuery(
    `SELECT * FROM post_project_review WHERE project_id = ? AND status = "1" ORDER BY id DESC`,
    [projectId]
  );
  return NextResponse.json(rows);
}

// POST
export async function POST(req) {
  const { projectId, list } = await req.json();

  if (!projectId || !list) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await executeQuery(
    "INSERT INTO post_project_review (project_id, list, status) VALUES (?, ?, ?)",
    [projectId, list, 1]
  );

  return NextResponse.json({ success: true });
}
