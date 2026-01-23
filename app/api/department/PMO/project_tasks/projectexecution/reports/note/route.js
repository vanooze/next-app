import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);

    // ✅ HARD RESTRICTION
    if (user.department !== "PMO") {
      return NextResponse.json(
        { error: "Only PMO can add or edit notes" },
        { status: 403 }
      );
    }

    const { report_id, note, note_personnel } = await req.json();

    if (!report_id) {
      return NextResponse.json({ error: "Missing report_id" }, { status: 400 });
    }

    await executeQuery(
      `UPDATE reporting
       SET note = ?, note_personnel = ?
       WHERE id = ?`,
      [note || null, note_personnel, report_id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update note error:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}
