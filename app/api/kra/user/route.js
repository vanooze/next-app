import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dept = user.department?.trim().toUpperCase();
    let query = "";
    let params = [];

    if (dept.includes("HR")) {
      query = `
       SELECT user_id, name, department
        FROM users_clean
        WHERE UPPER(TRIM(department)) != 'Z OLD'
      `;
    } else if (dept.startsWith("IT/DT")) {
      query = `
        SELECT user_id, name, department
        FROM users_clean
        WHERE UPPER(TRIM(department)) IN (?, ?, ?, ?)
      `;
      params = ["IT/DT", "IT/DT MMC", "IT/DT TECHNICAL", "IT/DT PROGRAMMER"];
    } else {
      query = `
        SELECT user_id, name, department
        FROM users_clean
        WHERE UPPER(TRIM(department)) = ?
      `;
      params = [dept];
    }

    const users = await executeQuery(query, params);

    return NextResponse.json(users);
  } catch (err) {
    console.error("Error fetching department users:", err);

    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
