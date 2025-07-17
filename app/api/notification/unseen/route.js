import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db"; // your db helper

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json({ error: "Missing name" }, { status: 400 });
  }

  try {
    const notifications = await executeQuery(
      "SELECT * FROM activity_logs WHERE name = ? AND deleted = 0 ORDER BY id DESC",
      [name]
    );
    return NextResponse.json(notifications);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
