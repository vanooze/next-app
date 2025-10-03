import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export async function POST(req) {
  try {
    const { status, startDate, endDate, description, projectManager } =
      await req.json();

    const latestProject = await executeQuery(
      "SELECT project_id FROM projects_manual WHERE project_id IS NOT NULL ORDER BY created_on DESC LIMIT 1"
    );

    let newProjectId = "PR00001";
    if (latestProject.length > 0 && latestProject[0].project_id) {
      const lastCode = String(latestProject[0].project_id);
      const num = parseInt(lastCode.replace("PR", ""), 10) + 1;
      newProjectId = "PR" + num.toString().padStart(5, "0");
    }

    const latestCustomer = await executeQuery(
      "SELECT customer_id FROM projects_manual WHERE customer_id IS NOT NULL ORDER BY created_on DESC LIMIT 1"
    );

    let newCustomerId = "CUST00001";
    if (latestCustomer.length > 0 && latestCustomer[0].customer_id) {
      const lastCust = String(latestCustomer[0].customer_id);
      const num = parseInt(lastCust.replace("CUST", ""), 10) + 1;
      newCustomerId = "CUST" + num.toString().padStart(5, "0");
    }

    const today = new Date().toISOString().split("T")[0];

    const result = await executeQuery(
      `
      INSERT INTO projects_manual
        (project_id, status, customer_id, start_date, end_date, description, created_on, project_manager)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        newProjectId,
        status,
        newCustomerId,
        startDate,
        endDate,
        description,
        today,
        projectManager,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Project inserted successfully",
      projectId: newProjectId,
      customerId: newCustomerId,
      result,
    });
  } catch (error) {
    console.error("Error inserting project:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
