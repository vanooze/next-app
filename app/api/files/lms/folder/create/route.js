import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, parent_id, user_name, access_users } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Folder name is required" },
        { status: 400 },
      );
    }

    const access =
      Array.isArray(access_users) && access_users.length > 0
        ? JSON.stringify(access_users)
        : null;

    const result = await executeQuery(
      `
      INSERT INTO lms_folder 
        (name, parent_id, created_by, access, created_at)
      VALUES 
        (?, ?, ?, ?, NOW())
      `,
      [name.trim(), parent_id ?? null, user_name, access],
    );

    return NextResponse.json({
      success: true,
      message: "Folder created successfully",
      id: result.insertId || null,
    });
  } catch (err) {
    console.error("Error creating LMS folder:", err);
    return NextResponse.json(
      { success: false, error: "Failed to create folder" },
      { status: 500 },
    );
  }
}
