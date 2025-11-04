import { NextResponse } from "next/server";
import { executeQuery, getConnection } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";
import { LoginAcumatica } from "@/app/lib/acumatica";

export async function POST(req) {
  const connection = await getConnection();

  try {
    // Step 1: Authenticate local user
    const user = await getUserFromToken(req);
    if (!user || !user.department) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Step 2: Parse request body
    const body = await req.json();
    const {
      clientName,
      projectDesc,
      dateReceived,
      salesPersonnel,
      status,
      username,
      password,
      name,
    } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Missing Acumatica credentials" },
        { status: 400 }
      );
    }

    // Step 3: Test both systems before any operation
    // Step 3: Test both systems before any operation
    const [dbTest, acumaticaLogin] = await Promise.allSettled([
      connection.query("SELECT 1"), // quick DB ping
      LoginAcumatica({ username, password }), // try Acumatica login
    ]);

    const dbOK = dbTest.status === "fulfilled";

    // ensure acumaticaLogin.value is defined and structured properly
    const acumaticaOK =
      acumaticaLogin.status === "fulfilled" &&
      !!acumaticaLogin.value &&
      (acumaticaLogin.value.success === true ||
        acumaticaLogin.value?.status === 200) &&
      (!!acumaticaLogin.value.cookies || !!acumaticaLogin.value.session);

    if (!dbOK || !acumaticaOK) {
      console.error("❌ Validation failed:", {
        dbOK,
        acumaticaOK,
        acumaticaResponse: acumaticaLogin.value,
      });
      return NextResponse.json(
        {
          success: false,
          error: !dbOK
            ? "Local database not reachable"
            : "Failed to authenticate with Acumatica (invalid login or no response)",
        },
        { status: 500 }
      );
    }
    // ✅ Both systems are ready — begin transaction
    await connection.beginTransaction();

    const baseUrl = process.env.ACUMATICA_BASE_URL;
    const customerUrl = `${baseUrl}/entity/Default/22.200.001/Customer`;
    const logoutUrl = `${baseUrl}/entity/auth/logout`;

    // Step 4: Prepare Acumatica cookies (safe and flexible)
    let cookies = "";

    // Acumatica may return an array, string, or object with .session
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

    // Step 5: Create customer in Acumatica
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

    // Step 6: Insert into local DB
    const [insertResult] = await connection.query(
      `
      INSERT INTO design_activity 
      (client_name, client_id, proj_desc, date_received, sales_personnel, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        clientName,
        customerID,
        projectDesc,
        dateReceived,
        salesPersonnel,
        status,
        name,
      ]
    );

    await connection.commit();

    // Step 7: Logout from Acumatica
    await fetch(logoutUrl, { method: "POST", headers: { Cookie: cookies } });

    return NextResponse.json({
      success: true,
      message: "Both local and Acumatica creation succeeded.",
      projectId: insertResult.insertId,
      customerID,
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
