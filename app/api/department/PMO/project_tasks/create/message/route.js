import { executeQuery } from "@/app/lib/eform";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department || !user.department.includes("PMO")) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const { taskKey, userKey, message, status, date } = body;

    const query = `INSERT INTO task_reply(
    task_key,
    user_key,
    message,
    status,
    date)
    VALUES (?,?,?,?,?)`;

    const result = await executeQuery(query, [
      taskKey,
      userKey,
      message,
      status,
      date,
    ]);

    return NextResponse.json({ success: true, soId: result.soId });
  } catch (err) {
    console.error("Error creating reply: ", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create reply",
      },
      { status: 500 }
    );
  }
}
