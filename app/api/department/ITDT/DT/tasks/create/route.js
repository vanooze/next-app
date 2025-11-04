import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";
import { getConnection } from "@/app/lib/db";
import { LoginAcumatica } from "@/app/lib/acumatica";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false, // important for FormData
  },
};

export async function POST(req) {
  const connection = await getConnection();

  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const formData = await req.formData();

    const clientName = formData.get("clientName");
    const projectDesc = formData.get("projectDesc");
    const dateReceived = formData.get("dateReceived");
    const salesPersonnel = formData.get("salesPersonnel");
    const status = formData.get("status");
    const username = formData.get("username");
    const password = formData.get("password");
    const name = formData.get("name");
    const file = formData.get("file");

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Missing Acumatica credentials" },
        { status: 400 }
      );
    }

    // ✅ 1. Test database + Acumatica login
    const [dbTest, acumaticaLogin] = await Promise.allSettled([
      connection.query("SELECT 1"),
      LoginAcumatica({ username, password }),
    ]);

    const dbOK = dbTest.status === "fulfilled";
    const acumaticaOK =
      acumaticaLogin.status === "fulfilled" &&
      !!acumaticaLogin.value &&
      (acumaticaLogin.value.success === true ||
        acumaticaLogin.value?.status === 200) &&
      (!!acumaticaLogin.value.cookies || !!acumaticaLogin.value.session);

    if (!dbOK || !acumaticaOK) {
      console.error("❌ Validation failed:", { dbOK, acumaticaOK });
      return NextResponse.json(
        {
          success: false,
          error: !dbOK
            ? "Local database not reachable"
            : "Failed to authenticate with Acumatica",
        },
        { status: 500 }
      );
    }

    await connection.beginTransaction();

    const baseUrl = process.env.ACUMATICA_BASE_URL;
    const customerUrl = `${baseUrl}/entity/Default/22.200.001/Customer`;
    const logoutUrl = `${baseUrl}/entity/auth/logout`;

    // ✅ 2. Build cookies
    let cookies = "";
    const cookieSource =
      acumaticaLogin.value?.cookies ||
      acumaticaLogin.value?.session ||
      acumaticaLogin.value ||
      "";

    if (Array.isArray(cookieSource)) {
      cookies = cookieSource
        .flatMap((cookie) => cookie.split(","))
        .map((c) => c.split(";")[0].trim())
        .filter((c) => c.includes("="))
        .join("; ");
    } else if (typeof cookieSource === "string") {
      cookies = cookieSource
        .split(",")
        .map((c) => c.split(";")[0].trim())
        .filter((c) => c.includes("="))
        .join("; ");
    } else if (typeof cookieSource === "object" && cookieSource.session) {
      cookies = cookieSource.session
        .split(",")
        .map((c) => c.split(";")[0].trim())
        .filter((c) => c.includes("="))
        .join("; ");
    }

    if (!cookies) {
      console.error("❌ Failed to extract cookies:", acumaticaLogin.value);
      return NextResponse.json(
        { success: false, error: "Failed to extract Acumatica cookies" },
        { status: 500 }
      );
    }

    // ✅ 3. Create customer in Acumatica
    const customerPayload = {
      CustomerName: { value: clientName },
      CustomerClass: { value: "LOCAL" },
      StatementCycleID: { value: "30" },
      Terms: { value: "30D" },
      Status: { value: "Active" },
    };

    const createResponse = await fetch(customerUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: cookies,
      },
      body: JSON.stringify(customerPayload),
    });

    const rawText = await createResponse.text();
    let createData;
    try {
      createData = JSON.parse(rawText);
    } catch {
      createData = { raw: rawText };
    }

    if (!createResponse.ok) {
      console.error("❌ Acumatica customer creation failed:", createData);
      await fetch(logoutUrl, { method: "POST", headers: { Cookie: cookies } });
      await connection.rollback();
      return NextResponse.json(
        {
          success: false,
          error:
            createData?.message || "Failed to create customer in Acumatica.",
        },
        { status: createResponse.status }
      );
    }

    const customerID = createData?.CustomerID?.value || null;

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

      // Folder path
      const dirPath = path.join(
        process.cwd(),
        "public",
        "uploads",
        "ocular report"
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

    // ✅ 5. Insert new project record into DB
    const [insertResult] = await connection.query(
      `
      INSERT INTO design_activity 
      (client_name, client_id, proj_desc, date_received, sales_personnel, status, created_by, attachment_name, attachment_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        clientName,
        customerID,
        projectDesc,
        dateReceived,
        salesPersonnel,
        status,
        name,
        filename,
        fileType,
      ]
    );

    await connection.commit();

    // ✅ 6. Logout Acumatica
    await fetch(logoutUrl, { method: "POST", headers: { Cookie: cookies } });

    return NextResponse.json({
      success: true,
      message: "Task created successfully and file uploaded",
      projectId: insertResult.insertId,
      customerID,
      filename,
    });
  } catch (err) {
    console.error("🔥 Error syncing with Acumatica:", err);
    if (connection) await connection.rollback();
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}
