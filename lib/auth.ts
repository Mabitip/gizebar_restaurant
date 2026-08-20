import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";

const COOKIE_NAME = "gize_admin_token";
const EXPIRY = "7d";
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_MINUTES = 15;
export const MIN_PASSWORD_LENGTH = 12;

const WEAK_JWT_SECRETS = new Set([
  "change-me-to-a-long-random-secret",
  "generate-a-long-random-secret-at-least-32-chars",
  "secret",
  "jwt_secret",
]);

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  role: Role;
};

type VerifiedToken = SessionPayload & { iat?: number };

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  if (
    process.env.NODE_ENV === "production" &&
    (secret.length < 32 || WEAK_JWT_SECRETS.has(secret))
  ) {
    throw new Error("JWT_SECRET is too weak for production");
  }
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

function allowDemoAuth() {
  return process.env.ALLOW_DEMO_AUTH === "true" && process.env.NODE_ENV !== "production";
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const raw = await verifyToken(token);
  if (!raw) return null;

  if (raw.userId.startsWith("demo-")) {
    return allowDemoAuth() ? { userId: raw.userId, email: raw.email, name: raw.name, role: raw.role } : null;
  }

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

    if (!user || !user.isActive) return null;
    if (user.role !== raw.role) return null;
    if (
      user.passwordChangedAt &&
      raw.iat &&
      user.passwordChangedAt.getTime() / 1000 > raw.iat
    ) {
      return null;
    }

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  } catch {
    return null;
  }
}

export async function requireSession(roles?: Role[]) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  if (roles && !roles.includes(session.role)) throw new Error("Forbidden");
  return session;
}

export { COOKIE_NAME };
