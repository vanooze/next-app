import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";

export async function GET(req) {
  try {
    const user = await getUserFromToken(req);

    // Optional: restrict access
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const query = `
  SELECT
    project_id,
    project_name,
    assigned_po AS assigned_personnel,
    description,
    attachment_name,
    attachment_type,
    date,
    status,
    'PO' AS type
  FROM po
  WHERE status = 1

  UNION ALL

  SELECT
    project_id,
    project_name,
    assigned_personnel,
    description,
    attachment_name,
    attachment_type,
    date,
    status,
    'Project Turn Over' AS type
  FROM project_turn_over
  WHERE status = 1

  UNION ALL

  SELECT
    project_id,
    project_name,
    assigned_personnel,
    description,
    attachment_name,
    attachment_type,
    date,
    status,
    'Proposal' AS type
  FROM proposal
  WHERE status = 1

  UNION ALL

  SELECT
    project_id,
    project_name,
    assigned_tor AS assigned_personnel,
    description,
    attachment_name,
    attachment_type,
    date,
    status,
    'TOR' AS type
  FROM tor
  WHERE status = 1

  ORDER BY date DESC
`;

    const results = await executeQuery(query);

    return NextResponse.json({ data: results });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
