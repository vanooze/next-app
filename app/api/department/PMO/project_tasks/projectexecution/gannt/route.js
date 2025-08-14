import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  const rows = await executeQuery(
    `SELECT 
       id, 
       parent_id, 
       title, 
       start_date, 
       end_date, 
       actual_start_date, 
       actual_end_date, 
       progress 
     FROM gannt_chart 
     WHERE project_id = ? 
     ORDER BY start_date`,
    [projectId]
  );

  return NextResponse.json(rows);
}
