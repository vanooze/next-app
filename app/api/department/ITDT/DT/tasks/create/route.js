import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";
import { LoginAcumatica } from "@/app/lib/acumatica";

export async function POST(req) {
  try {
    // Step 1: Authenticate local user
    const user = await getUserFromToken(req);
    if (!user || !user.department) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Step 2: Parse body
    const body = await req.json();
    const {
      clientName,
      projectDesc,
      dateReceived,
      salesPersonnel,
      status,
      username,
      password,
    } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Missing Acumatica credentials" },
        { status: 400 }
      );
    }

    // Step 3: Insert the project locally
    const insertQuery = `
      INSERT INTO design_activity 
      (client_name, proj_desc, date_received, sales_personnel, status)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await executeQuery(insertQuery, [
      clientName,
      projectDesc,
      dateReceived,
      salesPersonnel,
      status,
    ]);

    const projectId = result.insertId;

    // Step 4: Login to Acumatica
    const loginResult = await LoginAcumatica({ username, password });

    if (!loginResult?.success || !loginResult?.cookies) {
      console.error("❌ Acumatica login failed:", loginResult.error);
      return NextResponse.json(
        { success: false, error: loginResult?.error || "Failed to log in." },
        { status: 401 }
      );
    }

    const baseUrl = process.env.ACUMATICA_BASE_URL;
    const customerUrl = `${baseUrl}/entity/Default/22.200.001/Customer`;
    const logoutUrl = `${baseUrl}/entity/auth/logout`;

    // Step 5: Clean cookies
    const cleanCookies = (
      Array.isArray(loginResult.cookies)
        ? loginResult.cookies
        : [loginResult.cookies]
    )
      .flatMap((cookie) => cookie.split(","))
      .map((c) => c.split(";")[0].trim())
      .filter((c) => c.includes("="))
      .join("; ");

    const customerPayload = {
      CustomerName: { value: clientName },
      CustomerClass: { value: "LOCAL" },
      StatementCycleID: { value: "30" },
      Terms: { value: "30D" },
      Status: { value: "Active" },
    };

    // Step 7: Create the customer in Acumatica
    const createResponse = await fetch(customerUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: cleanCookies,
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
      console.error("❌ Failed to create customer:", createData);
      await fetch(logoutUrl, {
        method: "POST",
        headers: { Cookie: cleanCookies },
      });
      return NextResponse.json(
        {
          success: false,
          error: createData?.message || "Failed to create customer.",
          data: createData,
        },
        { status: createResponse.status }
      );
    }

    const customerID = createData?.CustomerID?.value || null;

    // Step 8: Logout from Acumatica
    await fetch(logoutUrl, {
      method: "POST",
      headers: { Cookie: cleanCookies },
    });

    // Step 9: Update project with customerID
    if (customerID) {
      const updateQuery = `
        UPDATE design_activity
        SET client_id = ?
        WHERE id = ?
      `;
      await executeQuery(updateQuery, [customerID, projectId]);
    }

    // Step 10: Return final result
    return NextResponse.json({
      success: true,
      message: "Project created and customer synced with Acumatica.",
      projectId,
      customerID,
    });
  } catch (err) {
    console.error("🔥 Error creating project and customer:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
