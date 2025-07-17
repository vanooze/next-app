import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const { clientName, taskDesc, dateReceived, personnel, date, status } =
      body;

    const query = `INSERT INTO pmo_activity(
    client_name,
    task_desc,
    date_received,
    personnel,
    date,
    status)
    VALUES (?,?,?,?,?,?)`;

    const result = await executeQuery(query, [
      clientName,
      taskDesc,
      dateReceived,
      personnel,
      date,
      status,
    ]);

    return NextResponse.json({ success: true, soId: result.soId });
  } catch (err) {
    console.error("Error creating task: ", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create task",
      },
      { status: 500 }
    );
  }
}
