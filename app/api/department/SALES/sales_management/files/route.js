import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";

export async function GET(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const taskId = url.searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: "taskId is required" },
        { status: 400 }
      );
    }

    const [row] = await executeQuery(
      `SELECT attachment_name FROM design_activity WHERE id = ?`,
      [taskId]
    );

    let files = [];

    if (row && row.attachment_name) {
      try {
        // attachment_name is stored as comma-separated string: "file1.pdf, file2.pdf"
        const fileNames = row.attachment_name
          .split(",")
          .map((f) => f.trim())
          .filter((f) => f.length > 0);

        // Convert to file objects with proper paths
        files = fileNames.map((fileName) => {
          const safeName = fileName.replace(/,/g, "-");
          return {
            name: fileName,
            path: `/uploads/ocular report/${encodeURIComponent(safeName)}`,
          };
        });
      } catch (err) {
        console.error("Failed to parse attachment_name:", err);
      }
    }

    return NextResponse.json({ success: true, files });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}

