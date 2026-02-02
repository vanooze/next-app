import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";
import { getConnection } from "@/app/lib/db";
import { LoginAcumatica } from "@/app/lib/acumatica";
import fs from "fs";
import path from "path";

export async function POST(req) {
  const connection = await getConnection();

  try {
    const user = await getUserFromToken(req);
    if (!user || !user.department) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 },
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

    const files = formData.getAll("files"); // ✅ multiple files

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Missing Acumatica credentials" },
        { status: 400 },
      );
    }

    // Validate DB + Acumatica login
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
      return NextResponse.json(
        {
          success: false,
          error: !dbOK
            ? "Local database not reachable"
            : "Failed to authenticate with Acumatica",
        },
        { status: 500 },
      );
    }

    await connection.beginTransaction();

    // Build cookies
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
    }

    // Create customer in Acumatica
    const baseUrl = process.env.ACUMATICA_BASE_URL;
    const customerUrl = `${baseUrl}/entity/Default/22.200.001/Customer`;
    const logoutUrl = `${baseUrl}/entity/auth/logout`;
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
      await fetch(logoutUrl, { method: "POST", headers: { Cookie: cookies } });
      await connection.rollback();
      return NextResponse.json(
        {
          success: false,
          error:
            createData?.message || "Failed to create customer in Acumatica.",
        },
        { status: createResponse.status },
      );
    }

    const customerID = createData?.CustomerID?.value || null;

    const savedFiles = [];

    // Store files as comma-separated string in attachment_name
    const attachmentName = savedFiles.length > 0 ? savedFiles.join(", ") : null;

    // Insert into DB
    const [insertResult] = await connection.query(
      `
      INSERT INTO sales_management 
      (client_name, client_id, proj_desc, date_received, sales_personnel, status, created_by, profiting_file)
      VALUES (?, ?, ?, ?, ?, 'On Going', ?, ?)
      `,
      [
        clientName,
        customerID,
        projectDesc,
        dateReceived,
        salesPersonnel,
        name,
        attachmentName,
      ],
    );

    await connection.commit();

    // Logout Acumatica
    await fetch(logoutUrl, { method: "POST", headers: { Cookie: cookies } });

    return NextResponse.json({
      success: true,
      message: "Task created successfully and files uploaded",
      salesId: insertResult.insertId,
      customerID,
      files: savedFiles,
    });
  } catch (err) {
    console.error("🔥 Error syncing with Acumatica:", err);
    if (connection) await connection.rollback();
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 },
    );
  } finally {
    if (connection) connection.release();
  }
}
