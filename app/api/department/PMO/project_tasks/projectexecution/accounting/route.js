import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

// GET - fetch saved accounting data for a project
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    const rows = await executeQuery(
      "SELECT * FROM accounting WHERE project_id = ? LIMIT 1",
      [projectId]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json([]);
    }

    const record = rows[0];

    const mapped = [
      {
        section: "Down Payment",
        checked: record.dpchecked ? 1 : 0,
        note: record.down_payment || "",
      },
      {
        section: "PB1",
        checked: record.pb1checked ? 1 : 0,
        note: record.pb1 || "",
      },
      {
        section: "PB2",
        checked: record.pb2checked ? 1 : 0,
        note: record.pb2 || "",
      },
      {
        section: "PB3",
        checked: record.pb3checked ? 1 : 0,
        note: record.pb3 || "",
      },
      {
        section: "Retention",
        checked: record.retentionchecked ? 1 : 0,
        note: record.retention || "",
      },
    ];

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("GET accounting error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST - create or update accounting data for a project
export async function POST(req) {
  try {
    const body = await req.json();
    const { projectId, section, checked, note } = body;

    if (!projectId || !section) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const rows = await executeQuery(
      "SELECT id FROM accounting WHERE project_id = ? LIMIT 1",
      [projectId]
    );

    let fieldNote = "";
    let fieldChecked = "";

    switch (section) {
      case "Down Payment":
        fieldNote = "down_payment";
        fieldChecked = "dpchecked";
        break;
      case "PB1":
        fieldNote = "pb1";
        fieldChecked = "pb1checked";
        break;
      case "PB2":
        fieldNote = "pb2";
        fieldChecked = "pb2checked";
        break;
      case "PB3":
        fieldNote = "pb3";
        fieldChecked = "pb3checked";
        break;
      case "Retention":
        fieldNote = "retention";
        fieldChecked = "retentionchecked";
        break;
      default:
        return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }

    const safeNote = note && note.trim() !== "" ? note.trim() : null;
    const safeChecked = checked ? 1 : 0;

    if (rows && rows.length > 0) {
      await executeQuery(
        `UPDATE accounting SET ${fieldNote} = ?, ${fieldChecked} = ? WHERE project_id = ?`,
        [safeNote, safeChecked, projectId]
      );
    } else {
      await executeQuery(
        `INSERT INTO accounting (project_id, ${fieldNote}, ${fieldChecked})
     VALUES (?, ?, ?)`,
        [projectId, safeNote, safeChecked]
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST accounting error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
