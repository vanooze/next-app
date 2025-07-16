import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  const result = await executeQuery(
    `SELECT assigned_personnel FROM attendees_mom WHERE project_id = ?`,
    [projectId]
  );

  if (result.length > 0) {
    return NextResponse.json({
      assignedPersonnel: result[0].assigned_personnel,
    });
  }

  return NextResponse.json({ assignedPersonnel: "" });
}
