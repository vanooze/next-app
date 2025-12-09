import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";

// DELETE - Soft delete QMS file (set deleted = 1)
export async function DELETE(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const fileId = url.searchParams.get("id");

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: "File ID is required" },
        { status: 400 }
      );
    }

    // Soft delete by setting deleted = 1
    await executeQuery(`UPDATE qms_files SET deleted = 1 WHERE id = ?`, [
      fileId,
    ]);

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting QMS file:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
