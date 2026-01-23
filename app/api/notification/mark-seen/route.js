import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export async function PATCH(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Missing notification id" },
      { status: 400 }
    );
  }

  try {
    await executeQuery(
      "UPDATE notifications_logs SET active = 0 WHERE id = ?",
      [id]
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Mark notification seen error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
