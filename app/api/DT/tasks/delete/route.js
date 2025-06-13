import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 }
      );
    }

    const query = `DELETE FROM design_activity WHERE id = ?`;
    const result = await executeQuery(query, [id]);

    return NextResponse.json({
      success: true,
      affectedRows: result.affectedRows,
    });
  } catch (err) {
    console.error("Error deleting task:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
