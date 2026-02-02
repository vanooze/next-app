import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";

export async function GET(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const url = new URL(req.url);
    const taskId = url.searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: "taskId is required" },
        { status: 400 },
      );
    }

    // Fetch design_activity by sales_id
    const [row] = await executeQuery(
      `SELECT attachment_name FROM design_activity WHERE id = ?`,
      [taskId],
    );

    let files = [];

    if (row && row.attachment_name) {
      const fileNames = row.attachment_name.split(",").map((f) => f.trim());

      files = fileNames.map((name) => ({
        name,
        path: `/uploads/ocular report/${encodeURIComponent(name)}`,
        revision: 0, // sales upload has no revision
      }));
    }

    return NextResponse.json({
      success: true,
      files,
      revisions: [{ revision: 0, files, label: "Original" }],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch files" },
      { status: 500 },
    );
  }
}
