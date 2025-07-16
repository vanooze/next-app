import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/eform";
import { getUserFromToken } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department.includes("PMO")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { projectId, accessList } = body;

    if (!projectId || !Array.isArray(accessList)) {
      return NextResponse.json(
        { error: "Missing or invalid projectId or accessList" },
        { status: 400 }
      );
    }

    const updatedAccess = accessList.join(", ");

    await executeQuery("UPDATE so SET access = ? WHERE idkey = ?", [
      updatedAccess,
      projectId,
    ]);

    return NextResponse.json({ success: true, updatedAccess });
  } catch (err) {
    console.error("Error updating access:", err);
    return NextResponse.json(
      { error: "Failed to update access" },
      { status: 500 }
    );
  }
}
