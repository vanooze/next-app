import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { taskId, action } = body; // taskId === sales_management.id

    if (!taskId || !action) {
      return NextResponse.json(
        { success: false, error: "taskId and action are required" },
        { status: 400 },
      );
    }

    if (!["decline", "accept"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "action must be 'decline' or 'accept'" },
        { status: 400 },
      );
    }

    // ✅ Ensure sales record exists
    const [salesRecord] = await executeQuery(
      `SELECT id FROM sales_management WHERE id = ?`,
      [taskId],
    );

    if (!salesRecord) {
      return NextResponse.json(
        { success: false, error: "Sales task not found" },
        { status: 404 },
      );
    }

    if (action === "decline") {
      // 🔁 Update DESIGN using sales_id (NEW PARENTING LOGIC)
      await executeQuery(
        `UPDATE design_activity 
         SET status = ? 
         WHERE sales_id = ?`,
        ["Declined", taskId],
      );

      // 🔁 Update SALES
      await executeQuery(
        `UPDATE sales_management 
         SET status = ?, sir_mjh = ?,
         WHERE id = ?`,
        ["Declined", "", taskId],
      );
    }

    if (action === "accept") {
      // Only sales status changes on accept
      await executeQuery(
        `UPDATE sales_management 
         SET status = ? 
         WHERE id = ?`,
        ["Accepted", taskId],
      );
    }

    return NextResponse.json({
      success: true,
      message: `Task ${action}ed successfully`,
    });
  } catch (err) {
    console.error("Error processing file action:", err);
    return NextResponse.json(
      { success: false, error: "Failed to process action" },
      { status: 500 },
    );
  }
}
