import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export async function PUT(req) {
  try {
    const { id, name, access } = await req.json();

    if (!id || !name?.trim()) {
      return NextResponse.json(
        { success: false, error: "Invalid payload" },
        { status: 400 },
      );
    }

    await executeQuery(
      `
      UPDATE qms_folder
      SET name = ?, access = ?
      WHERE id = ?
      `,
      [name.trim(), access ? JSON.stringify(access) : null, id],
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update folder error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update folder" },
      { status: 500 },
    );
  }
}
