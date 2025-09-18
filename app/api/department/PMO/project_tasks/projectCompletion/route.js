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

    const tabConfig = {
      war: { table: "war" },
      pib: { table: "reports", type: "PIB" },
      dr: { table: "dr" },
      Warranty: { table: "warranty" },
      builtPlans: { table: "built_plans" },
      csat: { table: "csat/cop", type: "CSAT" },
      cop: { table: "csat/cop", type: "COP" },
      coa: { table: "coc/coa", type: "COA" },
      coc: { table: "coc/coa", type: "COC" },
      trainingAcceptance: {
        table: "trainee_acceptance",
        type: "Training Acceptance",
      },
      trainingAttendance: {
        table: "trainee_acceptance",
        type: "Training Attendance",
      },
    };

    const results = {};

    for (const [tabName, { table, type }] of Object.entries(tabConfig)) {
      try {
        const columnsData = await executeQuery(
          `SHOW COLUMNS FROM \`${table}\``
        );
        const columnNames = columnsData.map((col) => col.Field);

        const baseColumns =
          tabName === "pib"
            ? [
                "project_id",
                "assigned_personnel AS uploader",
                "description",
                "attachment_name",
                "attachment_type",
                "date",
                "status",
                "type",
              ]
            : [
                "project_id",
                "uploader",
                "description",
                "attachment_name",
                "attachment_type",
                "date",
                "status",
                ...(columnNames.includes("type") ? ["type"] : []),
              ];

        const conditions = [];
        const params = [];

        if (id) {
          conditions.push("project_id = ?");
          params.push(id);
        }
        if (type && columnNames.includes("type")) {
          conditions.push("type = ?");
          params.push(type);
        }

        const whereClause = conditions.length
          ? `WHERE ${conditions.join(" AND ")}`
          : "";

        const rows = await executeQuery(
          `SELECT ${baseColumns.join(", ")} FROM \`${table}\` ${whereClause}`,
          params
        );

        results[tabName] = rows.map((r) => ({
          projectId: r.project_id,
          description: r.description,
          attachmentName: r.attachment_name,
          attachmentType: r.attachment_type,
          date: r.date,
          type: r.type || null,
          status: r.status,
          uploader: r.uploader || null,
        }));
      } catch (err) {
        console.warn(
          `Skipping table "${table}" - not found or error:`,
          err.message
        );
        results[tabName] = [];
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("API Error: ", error);
    return NextResponse.json(
      { error: "Failed to fetch project completion data" },
      { status: 500 }
    );
  }
}
