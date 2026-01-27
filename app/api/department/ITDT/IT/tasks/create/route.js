import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";
import { getConnection } from "@/app/lib/db";
import fs from "fs";
import path from "path";

export async function POST(req) {
  const connection = await getConnection();

  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 },
      );
    }

    const formData = await req.formData();

    const project = formData.get("project");
    const projectDesc = formData.get("projectDesc");
    const tasks = formData.get("tasks");
    const personnel = formData.get("personnel");
    const dateStart = formData.get("dateStart") || null;
    const dateEnd = formData.get("dateEnd") || null;
    const status = formData.get("status");

    await connection.query(
      `
      INSERT INTO it_activity
      (project, project_desc, tasks, personnel, date_start, date_end, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        project,
        projectDesc,
        tasks,
        personnel,
        dateStart || null,
        dateEnd || null,
        status,
      ],
    );

    await connection.commit();

    return NextResponse.json(
      { success: true, message: "Task created successfully" },
      { status: 201 },
    );
  } catch (err) {
    await connection.rollback();
    console.error("Create task error:", err);

    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}
