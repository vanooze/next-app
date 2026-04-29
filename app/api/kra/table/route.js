import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 },
      );
    }

    const kraItems = await req.json();

    if (!Array.isArray(kraItems) || kraItems.length === 0) {
      return NextResponse.json(
        { error: "No KRA data provided" },
        { status: 400 },
      );
    }

    for (const item of kraItems) {
      const {
        kra,
        kpi,
        achievement,
        weight,
        excellent,
        veryGood,
        good,
        needImprovement,
        poor,
        userId,
        userName,
        userDepartment,
        createdAt,
      } = item;

      await executeQuery(
        `INSERT INTO kra_scores_table
        (user_id,dept, created_by, date, kra, kpi, achievement, weight, excellent, very_good, good, need_improvements, poor)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId || null,
          userDepartment || user.department || null,
          userName || user.name || null,
          createdAt
            ? createdAt.split("T")[0]
            : new Date().toISOString().split("T")[0],
          kra || null,
          kpi || null,
          achievement || null,
          weight || null,
          excellent || null,
          veryGood || null,
          good || null,
          needImprovement || null,
          poor || null,
        ],
      );
    }

    return NextResponse.json({ message: "KRA saved successfully" });
  } catch (error) {
    console.error("KRA API Error:", error);
    return NextResponse.json({ error: "Failed to save KRA" }, { status: 500 });
  }
}
