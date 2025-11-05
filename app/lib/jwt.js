import { SignJWT, jwtVerify } from "jose";

const secret = process.env.JWT_SECRET || "super-secret-key";
const encoder = new TextEncoder();
const key = encoder.encode(secret);

// Create a JWT with configurable expiration
export async function createToken(payload, expiresIn = "1d") {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn) // e.g. "2m", "1h", "1d",
    .sign(key);
}

// Verify and decode a JWT
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}
