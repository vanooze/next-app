import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const rows = await executeQuery(
      `
      SELECT
        project_id,
        pic,
        pmo,
        freelance,
        technical,
        status
      FROM man_power
      WHERE status = "1"
      ${id ? "AND project_Id = ? " : ""}
    `,
      id ? [id] : []
    );

    const tasks = rows.map((r) => ({
      projectId: r.project_id,
      pic: r.pic,
      pmo: r.pmo,
      freelance: r.freelance,
      technical: r.technical,
      staus: r.status,
    }));

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("API Error: ", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
