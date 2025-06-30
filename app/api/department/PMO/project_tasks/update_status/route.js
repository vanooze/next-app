import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/eform";

export async function POST(req) {
  try {
    const { id, donePending } = await req.json();

    if (typeof id !== "number" || donePending === null) {
      return NextResponse.json(
        { error: "Missing or invalid parameters" },
        { status: 400 }
      );
    }

    const query = `
        UPDATE project_task
        SET done_pending = ?
        WHERE task_key = ?
        `;

    const result = await executeQuery(query, [donePending, id]);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Update failed:", error);
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}
