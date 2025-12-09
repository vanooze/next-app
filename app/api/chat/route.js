import { NextResponse } from "next/server";

export async function POST(req) {
  const { message, user } = await req.json();

  if (!message) {
    return NextResponse.json(
      { reply: "⚠️ No message provided" },
      { status: 400 }
    );
  }

  // Forward to n8n webhook
  const res = await fetch(
    // "http://localhost:5678/webhook-test/7774933e-d9d1-465a-8716-4397df0d2455",
    "http://localhost:5678/webhook/7774933e-d9d1-465a-8716-4397df0d2455",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        user,
      }),
    }
  );

  const data = await res.json().catch(() => ({}));

  return NextResponse.json({
    output:
      data.reply ??
      data.output ??
      data[0]?.output ??
      "AI response not available",
  });
}
