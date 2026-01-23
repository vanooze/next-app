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
    const id = searchParams.get("id");
    const status = searchParams.get("status");

    // ✅ Join projects with projects_customer to get customer_name
    let query = `
  SELECT
    p.id,
    p.project_id,
    p.status,
    p.customer_id,
    c.customer_name,
    p.start_date,
    p.description,
    p.created_on,
    p.currency,
    p.project_manager,
    p.access
  FROM projects AS p
  LEFT JOIN (
    SELECT customer_id, MAX(customer_name) AS customer_name
    FROM projects_customers
    GROUP BY customer_id
  ) AS c
  ON p.customer_id = c.customer_id
`;

    const params = [];

    if (id) {
      query += " WHERE p.project_id = ?";
      params.push(id);
    } else if (status) {
      query += " WHERE p.status = ?";
      params.push(status);
    }

    const rows = await executeQuery(query, params);

    const tasks = rows.map((r) => ({
      id: r.id,
      projectId: r.project_id,
      status: r.status,
      customerId: r.customer_id,
      customerName: r.customer_name,
      startDate: r.start_date,
      description: r.description,
      createdOn: r.created_on,
      currency: r.currency,
      projectManager: r.project_manager,
      access: r.access,
    }));

    return NextResponse.json(id ? tasks[0] : tasks);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch table" },
      { status: 500 },
    );
  }
}
