import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { taskId, action } = body; // action: "decline" or "accept"

    if (!taskId || !action) {
      return NextResponse.json(
        { success: false, error: "taskId and action are required" },
        { status: 400 }
      );
    }

    if (action !== "decline" && action !== "accept") {
      return NextResponse.json(
        { success: false, error: "action must be 'decline' or 'accept'" },
        { status: 400 }
      );
    }

    // Get the proj_id from sales_management to update design_activity
    const [salesRecord] = await executeQuery(
      `SELECT proj_id FROM sales_management WHERE id = ?`,
      [taskId]
    );

    if (!salesRecord || !salesRecord.proj_id) {
      return NextResponse.json(
        { success: false, error: "Task not found or missing proj_id" },
        { status: 404 }
      );
    }

    const projId = salesRecord.proj_id;

    if (action === "decline") {
      // Update design_activity status to "Finished to Decline"
      await executeQuery(`UPDATE design_activity SET status = ? WHERE id = ?`, [
        "Declined",
        projId,
      ]);

      await executeQuery(
        `UPDATE sales_management SET status = ? WHERE id = ?`,
        ["Declined", taskId]
      );
    } else if (action === "accept") {
      // Update sales_management status to "accepted"
      await executeQuery(
        `UPDATE sales_management SET status = ? WHERE id = ?`,
        ["Accepted", taskId]
      );
    }

    return NextResponse.json({
      success: true,
      message: `Task ${action}ed successfully`,
    });
  } catch (err) {
    console.error("Error processing file action:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process action",
      },
      { status: 500 }
    );
  }
}
