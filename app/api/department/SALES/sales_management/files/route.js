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

    const [row] = await executeQuery(
      `SELECT profiting_file FROM sales_management WHERE id = ?`,
      [taskId],
    );

    let files = [];

    if (row?.profiting_file) {
      try {
        const parsed =
          typeof row.profiting_file === "string"
            ? JSON.parse(row.profiting_file)
            : row.profiting_file;

        files = parsed.map((file) => ({
          name: file.name,
          path: `/uploads/profitting/${encodeURIComponent(file.name)}`,
          revision: file.revision ?? 0,
        }));
      } catch (err) {
        console.error("Failed to parse profiting_file:", err);
      }
    }

    return NextResponse.json({ success: true, files });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch files" },
      { status: 500 },
    );
  }
}
