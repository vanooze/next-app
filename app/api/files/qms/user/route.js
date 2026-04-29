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

    const users = await executeQuery(
      `
      SELECT 
        user_id,
        name,
        department,
        position
      FROM users_clean
      WHERE department IS NOT NULL
        AND TRIM(department) != 'Z OLD'
      ORDER BY department ASC, name ASC
      `,
    );

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);

    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
