import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";

const COOKIE_NAME = "gize_admin_token";
const EXPIRY = "7d";
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_MINUTES = 15;
export const MIN_PASSWORD_LENGTH = 12;

export const DEFAULT_JWT_SECRET = "gize-luxury-restaurant-bole-addis-ababa-jwt-secret-2024-32chars";

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  role: Role;
};

type VerifiedToken = SessionPayload & { iat?: number };

function getSecret() {
  const secret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createToken(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<VerifiedToken | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const data = payload as unknown as SessionPayload & { iat?: number };
    if (!data?.userId || !data?.role || !data?.email) return null;
    return {
      userId: data.userId,
      email: data.email,
      name: data.name || "",
      role: data.role,
      iat: typeof payload.iat === "number" ? payload.iat : undefined,
    };
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const raw = await verifyToken(token);
  if (!raw) return null;

  try {
    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.findUnique({
      where: { id: raw.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        passwordChangedAt: true,
      },
    });

    if (user) {
      if (!user.isActive) return null;
      if (user.role !== raw.role) return null;
      return {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    }
  } catch (err) {
    console.warn("getSession DB lookup skipped, relying on verified token:", err);
  }

  // Fallback to verified token session if DB is cold or user logged in via fallback
  if (raw.userId && raw.email && raw.role) {
    return {
      userId: raw.userId,
      email: raw.email,
      name: raw.name || "Staff",
      role: raw.role,
    };
  }

  return null;
}

export async function requireSession(roles?: Role[]) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  if (roles && !roles.includes(session.role)) throw new Error("Forbidden");
  return session;
}

export { COOKIE_NAME };
