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
    const { status, startDate, description, projectManager } = body;

    const latestProject = await executeQuery(
      "SELECT project_id FROM projects_manual ORDER BY id DESC LIMIT 1"
    );

    let newProjectId = "PR00001";
    if (latestProject.length > 0) {
      const lastCode = latestProject[0].project_id;
      const num = parseInt(lastCode.replace("PR", ""), 10) + 1;
      newProjectId = "PR" + num.toString().padStart(5, "0");
    }

    //Generate new customer_id (CUST00001, CUST00002, ...)
    const latestCustomer = await executeQuery(
      "SELECT customer_id FROM projects_manual ORDER BY id DESC LIMIT 1"
    );

    let newCustomerId = "CUST00001";
    if (latestCustomer.length > 0 && latestCustomer[0].customer_id) {
      const lastCust = latestCustomer[0].customer_id;
      const num = parseInt(lastCust.replace("CUST", ""), 10) + 1;
      newCustomerId = "CUST" + num.toString().padStart(5, "0");
    }

    // Insert new record
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const result = await executeQuery(
      `
      INSERT INTO projects_manual
        (project_id, status, customer_id, start_date, description, created_on, project_manager)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        newProjectId,
        status,
        newCustomerId,
        startDate,
        description,
        today,
        projectManager,
      ]
    );

    return NextResponse.json({
      success: true,
      insertedId: result.insertId,
      projectId: newProjectId,
      customerId: newCustomerId,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
