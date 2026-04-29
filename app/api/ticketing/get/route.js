import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export async function POST(req) {
  try {
    const { id, assignedPersonnel, acceptedDate, acceptedTime } =
      await req.json();

    await executeQuery(
      `
      UPDATE ticketing
      SET 
        assigned_personnel = COALESCE(assigned_personnel, ?),
        accepted_date = ?,
        accepted_time = ?,
        status = 'In Progress'
      WHERE id = ?
      `,
      [assignedPersonnel, acceptedDate, acceptedTime, id],
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Accept ticket error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
