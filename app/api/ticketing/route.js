import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const user = await getUserFromToken(req);
    // if (!user || !user.department) {
    //   return NextResponse.json(
    //     { error: "Unauthorized access" },
    //     { status: 403 }
    //   );
    // }
    const rows = await executeQuery(
      "SELECT * FROM ticketing WHERE deleted = 0",
    );
    const tasks = rows.map((r) => ({
      id: r.id,
      description: r.description,
      assignedPersonnel: r.assigned_personnel,
      department: r.department,
      requestedBy: r.requested_by,
      requestedDate: r.requested_date,
      requestedNote: r.requested_note,
      requestedFile: r.requested_file,
      acceptedDate: r.accepted_date,
      acceptedTime: r.accepted_time,
      finishedDate: r.finished_date,
      finishedTime: r.finished_time,
      personnelFile: r.personnel_file,
      status: r.status,
    }));
    return Response.json(tasks);
  } catch (error) {
    console.error("API Error: ", error);
    return Response.json({ error: "Failed to fetch table" }, { status: 500 });
  }
}
