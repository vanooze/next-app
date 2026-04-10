import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";

export async function GET(req) {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    const rows = await executeQuery(
      `
      SELECT
        id,
        project_id,
        task_id,
        description,
        unit,
        qty,
        date
      FROM procurement
      WHERE deleted = "0"
      ${projectId ? "AND project_id = ?" : ""}
      `,
      projectId ? [projectId] : [],
    );

    const tasks = rows.map((r) => ({
      id: r.id,
      projectId: r.project_id,
      taskId: r.task_id,
      description: r.description,
      unit: r.unit,
      qty: r.qty,
      date: r.date,
    }));

    return NextResponse.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error("API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch procurement data",
      },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 },
      );
    }

    const body = await req.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid payload format" },
        { status: 400 },
      );
    }

    for (const item of body) {
      const { id, projectId, taskId, description, unit, qty, date } = item;

      if (id) {
        // UPDATE existing row
        await executeQuery(
          `
          UPDATE procurement
          SET
            task_id = ?,
            description = ?,
            unit = ?,
            qty = ?,
            date = ?
          WHERE id = ?
          `,
          [taskId, description, unit, qty, date, id],
        );
      } else {
        // INSERT new row
        await executeQuery(
          `
          INSERT INTO procurement
          (project_id, task_id, description, unit, qty, date)
          VALUES (?, ?, ?, ?, ?, ?)
          `,
          [projectId, taskId, description, unit, qty, date],
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Procurement items saved successfully",
    });
  } catch (error) {
    console.error("Save Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save procurement data",
      },
      { status: 500 },
    );
  }
}
