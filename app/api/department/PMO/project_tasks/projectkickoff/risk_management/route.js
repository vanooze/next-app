import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";

export async function GET(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department) {
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
        project_id,
        risk_id,
        description,
        potential_impact,
        likelihood,
        severity,
        iso_clause,
        mitigation,
        owner,
        status,
        created_at
      FROM risk_management
      ${id ? "WHERE project_id = ?" : ""}
      ORDER BY created_at DESC
      `,
      id ? [id] : []
    );

    const risks = rows.map((r) => ({
      projectId: r.project_id,
      riskId: r.risk_id,
      description: r.description,
      potentialImpact: r.potential_impact,
      likelihood: r.likelihood,
      severity: r.severity,
      isoClause: r.iso_clause,
      mitigation: r.mitigation,
      owner: r.owner,
      status: r.status,
      createdAt: r.created_at,
    }));

    return NextResponse.json(risks);
  } catch (error) {
    console.error("API Error: ", error);
    return NextResponse.json(
      { error: "Failed to fetch risk data" },
      { status: 500 }
    );
  }
}
