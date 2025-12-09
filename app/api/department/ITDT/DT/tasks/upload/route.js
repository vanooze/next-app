import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";
import { logNotification } from "@/app/lib/notifications";
import path from "path";
import fs from "fs/promises";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const user = await getUserFromToken(req);

    if (!user || !user.department) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const taskId = formData.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: "taskId is required" },
        { status: 400 }
      );
    }

    const files = formData.getAll("files");
    if (!files.length) {
      return NextResponse.json(
        { success: false, error: "At least one file is required" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public/uploads/profitting");
    await fs.mkdir(uploadDir, { recursive: true });

    const savedFiles = [];

    for (const file of files) {
      if (!(file instanceof Blob)) continue;

      let originalName = file.name || "uploaded_file";

      // Sanitize filename: replace commas with dash, remove quotes, trim spaces
      const ext = path.extname(originalName);
      let baseName = path
        .basename(originalName, ext)
        .replace(/,/g, "-")
        .replace(/["']/g, "")
        .trim();

      const dateSuffix = new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "");
      let fileName = `${baseName}-${dateSuffix}${ext}`;
      let counter = 1;

      // Ensure unique filename on disk
      while (true) {
        try {
          await fs.access(path.join(uploadDir, fileName));
          counter++;
          fileName = `${baseName}-${dateSuffix}-v${counter}${ext}`;
        } catch {
          break;
        }
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(path.join(uploadDir, fileName), buffer);
      savedFiles.push(fileName);
    }

    const formattedDate = new Date().toISOString().split("T")[0];

    // Get existing files and status to determine revision number
    const [existing] = await executeQuery(
      `SELECT profiting_file, client_name, sales_personnel, status FROM design_activity WHERE id = ?`,
      [taskId]
    );

    let allFiles = [];
    let nextRevision = 0;

    if (existing && existing.profiting_file) {
      try {
        const fileData = JSON.parse(existing.profiting_file);

        // Check if it's the new revision format or old format
        if (Array.isArray(fileData) && fileData.length > 0) {
          if (
            typeof fileData[0] === "object" &&
            fileData[0].revision !== undefined
          ) {
            // New format - preserve existing files with their revisions
            allFiles = [...fileData];
            // Find the highest revision number
            const maxRevision = Math.max(
              ...fileData.map((f) => f.revision || 0)
            );
            // If status is "Declined", increment revision, otherwise keep same revision
            if (existing.status === "Declined") {
              nextRevision = maxRevision + 1;
            } else {
              nextRevision = maxRevision;
            }
          } else {
            // Old format - convert to new format with revision 0
            allFiles = fileData.map((name) => ({ name, revision: 0 }));
            // If status is "Declined", start revision 1, otherwise keep 0
            if (existing.status === "Declined") {
              nextRevision = 1;
            } else {
              nextRevision = 0;
            }
          }
        }
      } catch (err) {
        console.warn("Failed to parse existing files JSON:", err);
        // If parsing fails, treat as empty and start fresh
        nextRevision = 0;
      }
    }

    // Add new files with the appropriate revision number
    const newFiles = savedFiles.map((name) => ({
      name,
      revision: nextRevision,
    }));

    allFiles = [...allFiles, ...newFiles];

    // Update status to "Finished" when new files are uploaded (even after decline)
    await executeQuery(
      `
      UPDATE design_activity
      SET profiting_file = ?, sir_mjh = ?, status = ?
      WHERE id = ?
      `,
      [JSON.stringify(allFiles), formattedDate, "Finished", taskId]
    );

    if (existing) {
      const clientName = existing.client_name || "";
      const salesPersonnel = existing.sales_personnel || null;
      const message = `${clientName} Proposal Submission Available`.trim();
      const redirectUrl = `/sales?taskId=${taskId}&view=files`;

      try {
        await logNotification({
          type: "Proposal Submitted",
          message,
          receiverName: salesPersonnel,
          redirectUrl,
          active: 1,
        });
      } catch (notificationErr) {
        console.error("Failed to create notification log:", notificationErr);
      }
    }

    // Return files with proper path encoding
    const responseFiles = allFiles.map((f) => ({
      name: f.name,
      revision: f.revision,
      path: `/uploads/profitting/${encodeURIComponent(f.name)}`,
    }));

    return NextResponse.json({
      success: true,
      message: "Files uploaded successfully",
      files: responseFiles,
      upload_date: formattedDate,
    });
  } catch (err) {
    console.error("Error uploading files:", err);
    return NextResponse.json(
      { success: false, error: "Failed to upload files" },
      { status: 500 }
    );
  }
}
