import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const { id } = await req.json();

    if (!id)
      return NextResponse.json({ error: "Missing log ID" }, { status: 400 });

    await db.execute(`UPDATE activity_logs SET seen = TRUE WHERE id = ?`, [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking log as seen:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
