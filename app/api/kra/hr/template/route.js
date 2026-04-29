import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { template_name, table_ids, department, date } = await req.json();

    if (!template_name || !Array.isArray(table_ids) || table_ids.length === 0) {
      return NextResponse.json(
        { error: "Missing template_name or table_ids" },
        { status: 400 },
      );
    }

    const tableIdsJson = JSON.stringify(table_ids);

    await executeQuery(
      `INSERT INTO kra_table_template_hr (template_name, table_id,department, date) VALUES (?, ?, ?, ?)`,
      [template_name, tableIdsJson, department, date],
    );

    return NextResponse.json({
      success: true,
      message: "Template created successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 },
    );
  }
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const department = url.searchParams.get("department");
    if (!department) {
      return NextResponse.json(
        { error: "Department is required" },
        { status: 400 },
      );
    }

    const templates = await executeQuery(
      `SELECT id, template_name, table_id, date 
       FROM kra_table_template_hr 
       WHERE department = ?`,
      [department],
    );

    return NextResponse.json(templates);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 },
    );
  }
}
