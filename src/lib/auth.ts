import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET_STRING =
  process.env.JWT_SECRET || "cashback-sales-fallback-dev-secret-change-me";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);

// Distinct cookie name from the Marketing app so the two never collide.
export const COOKIE_NAME = "cashback_sales_session";

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

/** Sign a session JWT and set it as an httpOnly cookie. */
export async function createSession(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return token;
}

/** Verify a JWT string. Returns the payload or null if invalid/expired. */
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/** Read + verify the current Sales session from cookies (server components). */
export async function getCurrentSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** Clear the session cookie (logout). */
export async function clearSession(): Promise<void> {
  cookies().delete(COOKIE_NAME);
}

/**
 * Authorize a Sales request. Accepts a cookie or a Bearer token.
 * Returns the session payload, or null when unauthenticated.
 */
export async function checkAdminAuth(
  req?: NextRequest
): Promise<SessionPayload | null> {
  let token: string | undefined;

  if (req) {
    token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }
  } else {
    token = cookies().get(COOKIE_NAME)?.value;
  }

  if (!token) return null;
  return verifyToken(token);
}
