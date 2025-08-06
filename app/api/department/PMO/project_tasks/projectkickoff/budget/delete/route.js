import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "Missing item ID" },
        { status: 400 }
      );
    }

    await executeQuery(`DELETE FROM budget WHERE id = ?`, [itemId]);

    return NextResponse.json({ success: true, message: "Item deleted" });
  } catch (err) {
    console.error("Error deleting item:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
