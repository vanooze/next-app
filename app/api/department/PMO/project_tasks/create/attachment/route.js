import { executeQuery } from "@/app/lib/eform";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department?.includes("PMO")) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const {
      taskKey,
      userKey,
      attachName,
      attachType,
      status,
      attachDate,
      projectName,
    } = body;

    const query = `INSERT INTO task_attachment (
      task_key,
      user_key,
      attach_name,
      attach_type,
      status,
      date_attach,
      project_name
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const result = await executeQuery(query, [
      taskKey,
      userKey,
      attachName,
      attachType,
      status,
      attachDate,
      projectName,
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error creating attachment: ", err);
    return NextResponse.json(
      { success: false, error: "Failed to create attachment" },
      { status: 500 }
    );
  }
}
