import { cookies } from "next/headers";
import { verifyToken } from "./jwt";

export async function getUserFromToken(req) {
  try {
    const token = cookies().get("token")?.value;
    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload) return null;

    return {
      userId: payload.userId,
      username: payload.username,
      department: payload.department,
    };
  } catch (err) {
    console.error("Error verifying token:", err);
    return null;
  }
}
