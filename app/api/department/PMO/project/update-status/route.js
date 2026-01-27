import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 },
      );
    }

    const { projectId, status } = await req.json();

    // ✅ Only allow these transitions
    const allowedStatuses = ["For Payment", "Active"];

    if (!projectId || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status update" },
        { status: 400 },
      );
    }

    await executeQuery(`UPDATE projects SET status = ? WHERE project_id = ?`, [
      status,
      projectId,
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Status toggle error:", err);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 },
    );
  }
}
