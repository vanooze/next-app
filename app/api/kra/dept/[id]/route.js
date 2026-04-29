import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(req, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await executeQuery(
      "UPDATE kra_scores_table_dept SET deleted = 1 WHERE id = ?",
      [id],
    );

    return NextResponse.json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Soft delete error:", error);

    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 },
    );
  }
}
