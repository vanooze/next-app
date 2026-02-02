import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";

export async function DELETE(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const url = new URL(req.url);
    const folderId = url.searchParams.get("id");

    if (!folderId) {
      return NextResponse.json(
        { success: false, error: "Folder ID is required" },
        { status: 400 },
      );
    }

    await executeQuery(`UPDATE lms_folder SET deleted = 1 WHERE id = ?`, [
      folderId,
    ]);
    return NextResponse.json({
      success: true,
      message: "Folder deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting folder:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete folder" },
      { status: 500 },
    );
  }
}
