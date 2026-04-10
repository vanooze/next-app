import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";
import fs from "fs";
import path from "path";

export async function PUT(req) {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const formData = await req.formData();

    const id = formData.get("id");
    const filesToDelete = JSON.parse(formData.get("filesToDelete") || "[]");

    const uploadedFiles = formData.getAll("files");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Task ID required" },
        { status: 400 },
      );
    }

    // =========================
    // UPLOAD PATH
    // =========================
    const uploadDir = path.join(process.cwd(), "public/uploads/Repair Reports");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // =========================
    // GET EXISTING FILES
    // =========================
    const existingResult = await executeQuery(
      "SELECT file FROM repair_activity WHERE id = ?",
      [id],
    );

    let existingFiles = [];

    const raw = existingResult[0]?.file;

    if (raw) {
      try {
        if (raw.trim().startsWith("[")) {
          existingFiles = JSON.parse(raw);
        } else {
          existingFiles = raw
            .split(",")
            .map((f) => f.trim())
            .filter(Boolean);
        }
      } catch (err) {
        console.error("Parse error:", err);
        existingFiles = [];
      }
    }

    // =========================
    // DELETE FILES (SAFE)
    // =========================
    const remainingFiles = existingFiles.filter((file) => {
      if (filesToDelete.includes(file)) {
        const filePath = path.join(uploadDir, file);

        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (err) {
          console.warn("Delete failed:", filePath);
        }

        return false;
      }
      return true;
    });

    // =========================
    // SAVE NEW FILES
    // =========================
    const newSavedFiles = [];

    for (const file of uploadedFiles) {
      if (!file || typeof file === "string") continue;

      const buffer = Buffer.from(await file.arrayBuffer());

      const ext = path.extname(file.name);
      const base = path.basename(file.name, ext).replace(/[^a-zA-Z0-9-_]/g, "");

      const fileName = `${base}-${Date.now()}${ext}`;
      const filePath = path.join(uploadDir, fileName);

      fs.writeFileSync(filePath, buffer);

      newSavedFiles.push(fileName); // ✅ SAME AS ADD TASK
    }

    // =========================
    // FINAL FILE ARRAY
    // =========================
    const finalFiles = [...remainingFiles, ...newSavedFiles];

    // =========================
    // UPDATE DB
    // =========================
    await executeQuery(
      `
      UPDATE repair_activity SET
        client_name = ?,
        description = ?,
        date = ?,
        assigned_personnel = ?,
        status = ?,
        unit = ?,
        severity = ?,
        completion = ?,
        file = ?
      WHERE id = ?
      `,
      [
        formData.get("clientName"),
        formData.get("description"),
        formData.get("date"),
        formData.get("personnel"),
        formData.get("status"),
        formData.get("unit"),
        formData.get("severity"),
        formData.get("completion"),
        finalFiles.length ? JSON.stringify(finalFiles) : null,
        id,
      ],
    );

    return NextResponse.json({
      success: true,
      files: finalFiles,
    });
  } catch (err) {
    console.error("UPDATE ERROR:", err);

    return NextResponse.json(
      { success: false, error: "Failed to update task" },
      { status: 500 },
    );
  }
}
