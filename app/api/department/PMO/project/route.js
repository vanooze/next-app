import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";

export async function GET(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const rows = await executeQuery(
      `
      SELECT
        id,
        project_id,
        status,
        customer_id,
        start_date,
        description,
        created_on,
        currency,
        project_manager,
        access
        FROM projects
      ${id ? "WHERE project_id = ?" : ""}
    `,
      id ? [id] : []
    );

    const tasks = rows.map((r) => ({
      id: r.id,
      projectId: r.project_id,
      status: r.status,
      customerId: r.customer_id,
      startDate: r.start_date,
      description: r.description,
      createdOn: r.created_on,
      currency: r.currency,
      projectManager: r.project_manager,
      access: r.access,
    }));

    return NextResponse.json(id ? tasks[0] : tasks);
  } catch (error) {
    console.error("API Error: ", error);
    return NextResponse.json(
      { error: "Failed to fetch table" },
      { status: 500 }
    );
  }
}
