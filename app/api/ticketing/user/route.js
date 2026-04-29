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

    const query = `
      SELECT user_id, name, department_clean
      FROM users_clean
      WHERE UPPER(TRIM(department_clean)) != 'Z OLD'
      AND UPPER(TRIM(department_clean)) != 'EXECUTIVE'
      ORDER BY department_clean, name 
    `;

    const users = await executeQuery(query);

    return NextResponse.json(users);
  } catch (err) {
    console.error("Error fetching all users:", err);

    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
