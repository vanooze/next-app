import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";

export async function GET(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const rows = await executeQuery(
      `
      SELECT
        project_id,
        uploader,
        description,      
        attachment_name,
        attachment_type,
        date,
        status
     FROM overall_report
      WHERE status = "1"
      ${id ? "AND project_Id = ?" : ""}
    `,
      id ? [id] : []
    );

    const tasks = rows.map((r) => ({
      projectId: r.project_id,
      uploader: r.uploader,
      description: r.description,
      attachmentName: r.attachment_name,
      attachmentType: r.attachment_type,
      date: r.date,
      status: r.status,
    }));

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("API Error: ", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const formData = await req.formData();

    const projectId = formData.get("projectId");
    const uploader = formData.get("uploader");
    const description = formData.get("description");
    const status = formData.get("status");
    const attachDate = formData.get("attachDate");
    const file = formData.get("file");

    if (!projectId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let filename = null;
    let fileType = null;

    if (
      file &&
      typeof file === "object" &&
      "arrayBuffer" in file &&
      file.size > 0
    ) {
      const buffer = Buffer.from(await file.arrayBuffer());
      fileType = file.type;

      const dirPath = path.join(
        process.cwd(),
        "public",
        "uploads",
        projectId,
        "post_project"
      );
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const ext = path.extname(file.name);
      const base = path.basename(file.name, ext);
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");

      filename = `${base}-${todayStr}${ext}`;

      let version = 1;
      while (fs.existsSync(path.join(dirPath, filename))) {
        filename = `${base}-${todayStr}-v${version}${ext}`;
        version++;
      }

      const savePath = path.join(dirPath, filename);
      fs.writeFileSync(savePath, buffer);
    }

    await executeQuery(
      `INSERT INTO overall_report (
        project_id, 
        uploader,
        description, 
        attachment_name, 
        attachment_type, 
        date,  
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        projectId,
        uploader,
        description || null,
        filename,
        fileType,
        attachDate || null,
        status || null,
      ]
    );

    return NextResponse.json({
      success: true,
      file,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Failed to upload" }, { status: 500 });
  }
}
