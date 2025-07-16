import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department || !user.department.includes("PMO")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }
    const body = await req.json();

    const {
      user_id,
      name,
      action,
      table_name,
      record_id,
      description,
      link,
      seen,
    } = body;

    if (
      user_id == null ||
      !name ||
      !action ||
      !table_name ||
      record_id == null ||
      !description ||
      !link
    ) {
      return NextResponse.json(
        { error: "Missing required fields", logValues },
        { status: 400 }
      );
    }

    const query = `
        INSERT INTO activity_logs 
        (user_id, 
        name, 
        action, 
        table_name, 
        record_id, 
        description, 
        link, 
        seen)
        VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?)
      `;

    const result = await executeQuery(query, [
      user_id,
      name,
      action,
      table_name,
      record_id,
      description,
      link,
      seen,
    ]);

    return NextResponse.json({ success: true, insertId: result.insertId });
  } catch (err) {
    console.error("🚨 SQL Insert Error:", err, "values:", logValues);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
