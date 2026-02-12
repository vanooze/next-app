import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 400 },
      );
    }

    // Mark note as deleted
    await executeQuery(
      "UPDATE design_project_note SET deleted = 1 WHERE id = ?",
      [id],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete note error:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 },
    );
  }
}
