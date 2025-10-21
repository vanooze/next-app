let acumaticaSession = null;
export async function LoginAcumatica({ username, password }) {
  const baseUrl = process.env.ACUMATICA_BASE_URL + "/entity/auth/login";

  const credentials = {
    name: username,
    password: password,
    company: process.env.ACUMATICA_TENANT,
  };

  try {
    if (acumaticaSession) {
      return {
        success: true,
        session: acumaticaSession,
      };
    }

    const res = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const cookies = res.headers.get("set-cookie");
    const rawResponse = await res.text();

    if (!res.ok) {
      return {
        success: false,
        status: res.status,
        cookies,
        rawResponse,
      };
    }

    acumaticaSession = cookies;
    return {
      success: true,
      cookies,
      rawResponse,
    };
  } catch (error) {
    console.error("❌ Error logging in to Acumatica:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
