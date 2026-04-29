import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export async function POST(req) {
  try {
    const { status, id } = await req.json();

    await executeQuery(
      `
      UPDATE ticketing
      SET 
        status = ?
      WHERE id = ?
      `,
      [status, id],
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Finish ticket error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
