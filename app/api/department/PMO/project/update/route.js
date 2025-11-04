import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      id,
      status = null,
      startDate = null,
      endDate = null,
      description = null,
      projectManager = null,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Project ID is required for update" },
        { status: 400 }
      );
    }

    const query = `
      UPDATE projects SET
        status = ?,
        start_date = ?,
        description = ?,
        project_manager = ?
      WHERE id = ?
    `;

    const result = await executeQuery(query, [
      status,
      startDate,
      endDate,
      description,
      projectManager,
      id,
    ]);

    return NextResponse.json({
      success: true,
      affectedRows: result.affectedRows,
    });
  } catch (err) {
    console.error("Error updating project: ", err);
    return NextResponse.json(
      { success: false, error: "Failed to update project" },
      { status: 500 }
    );
  }
}
