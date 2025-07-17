import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json({ error: "Missing name" }, { status: 400 });
  }

  try {
    const logs = await executeQuery({
      query: `SELECT * FROM activity_logs WHERE name = ? AND deleted = 0 ORDER BY created_at DESC`,
      values: [name],
    });

    return NextResponse.json(logs);
  } catch (err) {
    console.error("Notification fetch error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  const { name } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "Missing name" }, { status: 400 });
  }

  try {
    await executeQuery({
      query: `UPDATE activity_logs SET seen = TRUE WHERE name = ?`,
      values: [name],
    });

    return NextResponse.json({ message: "Marked as seen" });
  } catch (err) {
    console.error("Notification update error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
