import { NextResponse } from "next/server";

let acumaticaSession = null;

export async function GET() {
  const baseUrl = "https://gakkenphil.acumatica.com/entity/auth/login";
  const credentials = {
    name: "ivan.balo@avolutioninc.net",
    password: "Avolution@01",
    company: "AVOLUTION",
  };

  try {
    // If already logged in, skip re-login
    if (acumaticaSession) {
      console.log("✅ Reusing existing Acumatica session");
      return NextResponse.json({ success: true, session: acumaticaSession });
    }

    // Otherwise login
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const cookies = res.headers.get("set-cookie");
    const rawResponse = await res.text();

    if (!res.ok) {
      return NextResponse.json({
        success: false,
        status: res.status,
        cookies,
        rawResponse,
      });
    }

    // Save session for reuse
    acumaticaSession = cookies;

    return NextResponse.json({
      success: true,
      cookies,
      rawResponse,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
