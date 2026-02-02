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

    if (!user?.department) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 },
      );
    }

    const formData = await req.formData();
    const salesId = formData.get("salesId");

    if (!salesId) {
      return NextResponse.json(
        { success: false, error: "salesId is required" },
        { status: 400 },
      );
    }

    const files = formData.getAll("files");
    if (!files.length) {
      return NextResponse.json(
        { success: false, error: "At least one file is required" },
        { status: 400 },
      );
    }

    const uploadDir = path.join(process.cwd(), "public/uploads/profitting");
    await fs.mkdir(uploadDir, { recursive: true });

    const savedFiles = [];

    for (const file of files) {
      if (!(file instanceof Blob)) continue;

      const ext = path.extname(file.name);
      let baseName = path
        .basename(file.name, ext)
        .replace(/,/g, "-")
        .replace(/["']/g, "")
        .trim();
      const dateSuffix = new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "");
      let fileName = `${baseName}-${dateSuffix}${ext}`;
      let counter = 1;

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

    // 1️⃣ Fetch existing data from design_activity using sales_id
    const [existingDesign] = await executeQuery(
      `SELECT id, profiting_file, client_name, sales_personnel, status 
       FROM design_activity 
       WHERE sales_id = ?`,
      [salesId],
    );

    // 2️⃣ Fetch sales record
    const [existingSales] = await executeQuery(
      `SELECT id, profiting_file, sales_personnel, client_name, status 
       FROM sales_management 
       WHERE id = ?`,
      [salesId],
    );

    if (!existingSales) {
      return NextResponse.json(
        { success: false, error: "Sales record not found" },
        { status: 404 },
      );
    }

    // 3️⃣ Determine next revision and merge existing files
    let allFiles = [];
    let nextRevision = 0;

    if (existingDesign?.profiting_file) {
      try {
        const fileData = JSON.parse(existingDesign.profiting_file);
        if (Array.isArray(fileData) && fileData.length > 0) {
          if (
            typeof fileData[0] === "object" &&
            fileData[0].revision !== undefined
          ) {
            allFiles = [...fileData];
            const maxRevision = Math.max(
              ...fileData.map((f) => f.revision || 0),
            );
            nextRevision =
              existingDesign.status === "Declined"
                ? maxRevision + 1
                : maxRevision;
          } else {
            allFiles = fileData.map((name) => ({ name, revision: 0 }));
            nextRevision = existingDesign.status === "Declined" ? 1 : 0;
          }
        }
      } catch (err) {
        console.warn("Failed to parse existing files JSON:", err);
      }
    }

    const newFiles = savedFiles.map((name) => ({
      name,
      revision: nextRevision,
    }));
    allFiles = [...allFiles, ...newFiles];

    // 4️⃣ Update design_activity
    if (existingDesign) {
      await executeQuery(
        `UPDATE design_activity 
         SET profiting_file = ?, sir_mjh = ?, status = ? 
         WHERE sales_id = ?`,
        [JSON.stringify(allFiles), formattedDate, "Finished", salesId],
      );
    }

    // 5️⃣ Update sales_management
    await executeQuery(
      `UPDATE sales_management 
       SET profiting_file = ?, sir_mjh = ?,  status = ? 
       WHERE id = ?`,
      [JSON.stringify(allFiles), formattedDate, "Submitted", salesId],
    );

    // 6️⃣ Log notification for sales personnel
    const clientName = existingSales.client_name || "";
    const salesPersonnel = existingSales.sales_personnel || null;
    if (salesPersonnel) {
      await logNotification({
        type: "Proposal Submitted",
        message: `${clientName} Proposal Submission Available`.trim(),
        receiverName: salesPersonnel,
        redirectUrl: `/sales?taskId=${salesId}&view=files`,
        active: 1,
      });
    }

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
      { status: 500 },
    );
  }
}
