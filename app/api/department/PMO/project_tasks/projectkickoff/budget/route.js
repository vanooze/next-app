import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json([], { status: 200 });
  }

  const results = await executeQuery(
    "SELECT id, item_name, price FROM budget WHERE project_id = ?",
    [projectId]
  );

  const parsedResults = results.map((item) => ({
    ...item,
    price: parseFloat(item.price),
  }));

  return NextResponse.json(parsedResults);
}
