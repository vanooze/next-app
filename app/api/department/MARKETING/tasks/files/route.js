import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

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
      `SELECT file FROM marketing_activity WHERE id = ?`,
      [taskId],
    );

    let files = [];

    if (row && row.file) {
      try {
        const attachments = JSON.parse(row.file); // JSON array
        if (Array.isArray(attachments)) {
          files = attachments.map((name) => ({
            name,
            path: `/uploads/marketing/${encodeURIComponent(name)}`,
          }));
        }
      } catch (err) {
        console.error("Failed to parse file JSON:", err);
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
