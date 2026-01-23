import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const receivers = searchParams.getAll("receiver");

  const isDesiree = receivers.some(
    (v) => v?.trim().toUpperCase() === "DESIREE"
  );

  if (isDesiree) {
    const query = `
      SELECT id, type, message, receiver_name, redirect_url, active
      FROM notifications_logs
      ORDER BY active DESC, id DESC
    `;

    try {
      const notifications = await executeQuery(query);
      return NextResponse.json(notifications);
    } catch (err) {
      console.error("Notifications fetch error:", err);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }

  // 🔽 Normal behavior for all other users
  const normalized = Array.from(
    new Set(
      receivers
        .map((v) => v?.trim().toLowerCase())
        .filter((v) => v && v.length > 0)
    )
  );

  if (normalized.length === 0) {
    return NextResponse.json([]);
  }

  const conditions = normalized
    .map(() => "LOWER(receiver_name) = ?")
    .join(" OR ");

  const query = `
    SELECT id, type, message, receiver_name, redirect_url, active
    FROM notifications_logs
    WHERE ${conditions}
    ORDER BY active DESC, id DESC
  `;

  try {
    const notifications = await executeQuery(query, normalized);
    return NextResponse.json(notifications);
  } catch (err) {
    console.error("Notifications fetch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
