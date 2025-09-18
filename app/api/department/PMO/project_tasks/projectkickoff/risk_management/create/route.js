import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const { projectId, risks } = await req.json();
    if (!projectId || !Array.isArray(risks)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    for (const risk of risks) {
      await executeQuery(
        `
        INSERT INTO risk_management 
          (project_id, risk_id, description, potential_impact, likelihood, severity, iso_clause, mitigation, owner, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())
        ON DUPLICATE KEY UPDATE
          description = VALUES(description),
          potential_impact = VALUES(potential_impact),
          likelihood = VALUES(likelihood),
          severity = VALUES(severity),
          iso_clause = VALUES(iso_clause),
          mitigation = VALUES(mitigation),
          owner = VALUES(owner),
          status = VALUES(status)
        `,
        [
          projectId,
          risk.riskId || null,
          risk.description || null,
          risk.potentialImpact || null,
          risk.likelihood || null,
          risk.severity || null,
          risk.isoClause || null,
          risk.mitigation || null,
          risk.owner || null,
          risk.status || null,
        ]
      );
    }

    return NextResponse.json({ message: "Risks saved successfully" });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to save risks" },
      { status: 500 }
    );
  }
}
