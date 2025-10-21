import { NextResponse } from "next/server";
import { LoginAcumatica } from "@/app/lib/acumatica";

export async function POST(req) {
  try {
    const body = await req.json();
    const { username, password, clientId, projectDesc, dateReceived } = body;

    if (!username || !password || !clientId || !projectDesc || !dateReceived) {
      console.error("❌ Missing fields:", {
        username,
        password,
        clientId,
        projectDesc,
        dateReceived,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields for Acumatica project.",
        },
        { status: 400 }
      );
    }

    // Step 1: Login to Acumatica
    const loginResult = await LoginAcumatica({ username, password });

    if (!loginResult?.success || !loginResult?.cookies) {
      console.error("❌ Acumatica login failed:", loginResult.error);
      return NextResponse.json(
        { success: false, error: loginResult?.error || "Failed to log in." },
        { status: 401 }
      );
    }

    const baseUrl = process.env.ACUMATICA_BASE_URL;
    const projectUrl = `${baseUrl}/entity/Default/22.200.001/Project`;
    const logoutUrl = `${baseUrl}/entity/auth/logout`;

    // Step 2: Prepare cookies
    const cleanCookies = (
      Array.isArray(loginResult.cookies)
        ? loginResult.cookies
        : [loginResult.cookies]
    )
      .flatMap((cookie) => cookie.split(","))
      .map((c) => c.split(";")[0].trim())
      .filter((c) => c.includes("="))
      .join("; ");

    // Step 3: Prepare project payload
    const projectPayload = {
      Description: { value: projectDesc },
      Customer: { value: clientId },
      Status: { value: "In Planning" },
      Hold: { value: true },
      StartDate: { value: dateReceived },
    };

    // Step 4: Create project in Acumatica
    const createResponse = await fetch(projectUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: cleanCookies,
      },
      body: JSON.stringify(projectPayload),
    });

    const rawText = await createResponse.text();
    let createData;
    try {
      createData = JSON.parse(rawText);
    } catch {
      createData = { raw: rawText };
    }

    if (!createResponse.ok) {
      console.error(
        `❌ Failed to create project (${createResponse.status})`,
        createData
      );
      await fetch(logoutUrl, {
        method: "POST",
        headers: { Cookie: cleanCookies },
      });
      return NextResponse.json(
        {
          success: false,
          error: createData?.message || "Failed to create project.",
          data: createData,
        },
        { status: createResponse.status }
      );
    }

    // Step 5: Logout from Acumatica
    await fetch(logoutUrl, {
      method: "POST",
      headers: { Cookie: cleanCookies },
    });

    // Step 6: Return final response
    return NextResponse.json({
      success: true,
      message: "Project created successfully in Acumatica.",
      data: createData,
    });
  } catch (error) {
    console.error("🔥 Unexpected error creating project:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
