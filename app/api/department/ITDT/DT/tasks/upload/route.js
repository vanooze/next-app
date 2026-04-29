import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";
import { logNotification } from "@/app/lib/notifications";
import path from "path";
import fs from "fs/promises";

export const dynamic = "force-dynamic";

const getSafeJSON = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
};

const normalizeFiles = (fileData) => {
  if (!Array.isArray(fileData)) return [];

  return fileData.map((f) => {
    if (typeof f === "string") {
      return { name: f, revision: 0, notes: "" };
    }
    return {
      name: f.name,
      revision: f.revision ?? 0,
      notes: f.notes ?? "",
    };
  });
};

const getNextRevision = (files, status) => {
  if (!files.length) return 0;

  const maxRevision = Math.max(...files.map((f) => f.revision || 0));
  return status === "Declined" ? maxRevision + 1 : maxRevision;
};

const generateFileName = async (uploadDir, originalName) => {
  const ext = path.extname(originalName);
  let baseName = path
    .basename(originalName, ext)
    .replace(/,/g, "-")
    .replace(/["']/g, "")
    .trim();

  const dateSuffix = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  let fileName = `${baseName}-${dateSuffix}${ext}`;
  let counter = 1;

  while (true) {
    try {
      await fs.access(path.join(uploadDir, fileName));
      fileName = `${baseName}-${dateSuffix}-v${++counter}${ext}`;
    } catch {
      break;
    }
  }

  return fileName;
};

const saveFilesToDisk = async (files, uploadDir) => {
  const saved = [];

  for (const file of files) {
    if (!(file instanceof Blob)) continue;

    const fileName = await generateFileName(uploadDir, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());

    await fs.writeFile(path.join(uploadDir, fileName), buffer);
    saved.push(fileName);
  }

  return saved;
};

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
    const notes = formData.get("notes") || "";

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

    const savedFiles = await saveFilesToDisk(files, uploadDir);

    const [design] = await executeQuery(
      `SELECT profiting_file, status 
       FROM design_activity 
       WHERE sales_id = ?`,
      [salesId],
    );

    const [sales] = await executeQuery(
      `SELECT client_name, sales_personnel 
       FROM sales_management 
       WHERE id = ?`,
      [salesId],
    );

    if (!sales) {
      return NextResponse.json(
        { success: false, error: "Sales record not found" },
        { status: 404 },
      );
    }

    const existingFiles = normalizeFiles(getSafeJSON(design?.profiting_file));

    const nextRevision = getNextRevision(existingFiles, design?.status);

    const newFiles = savedFiles.map((name) => ({
      name,
      revision: nextRevision,
      notes,
    }));

    const allFiles = [...existingFiles, ...newFiles];
    const formattedDate = new Date().toISOString().split("T")[0];

    if (design) {
      await executeQuery(
        `UPDATE design_activity 
         SET profiting_file = ?, sir_mjh = ?, status = ? 
         WHERE sales_id = ?`,
        [JSON.stringify(allFiles), formattedDate, "Finished", salesId],
      );
    }

    await executeQuery(
      `UPDATE sales_management 
       SET profiting_file = ?, sir_mjh = ?, status = ? 
       WHERE id = ?`,
      [JSON.stringify(allFiles), formattedDate, "Submitted", salesId],
    );

    if (sales.sales_personnel) {
      await logNotification({
        type: "Proposal Submitted",
        message:
          `${sales.client_name || ""} Proposal Submission Available`.trim(),
        receiverName: sales.sales_personnel,
        redirectUrl: `/sales?taskId=${salesId}&view=files`,
        active: 1,
      });
    }

    const responseFiles = allFiles.map((f) => ({
      name: f.name,
      revision: f.revision,
      notes: f.notes,
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
