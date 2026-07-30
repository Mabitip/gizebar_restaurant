"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  clearAuthCookie,
  createToken,
  hashPassword,
  LOCKOUT_MINUTES,
  MAX_LOGIN_ATTEMPTS,
  setAuthCookie,
  verifyPassword,
} from "@/lib/auth";
import { homePathForRole } from "@/lib/permissions";
import { rateLimit } from "@/lib/rate-limit";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { headers } from "next/headers";
import type { Role } from "@prisma/client";

function allowDemoBypass() {
  return process.env.NODE_ENV !== "production";
}

export async function loginAction(input: LoginInput) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Invalid credentials.", redirectTo: null as string | null };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for") || "unknown";
  if (!rateLimit(`login:${ip}`, 8, 60_000).success) {
    return {
      success: false,
      message: "Too many login attempts. Try again shortly.",
      redirectTo: null,
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });

    if (!user || !user.isActive) {
      return { success: false, message: "Invalid email or password.", redirectTo: null };
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const mins = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000);
      return {
        success: false,
        message: `Account locked. Try again in ${mins} minute(s).`,
        redirectTo: null,
      };
    }

    const valid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!valid) {
      const attempts = user.failedLoginAttempts + 1;
      const lockedUntil =
        attempts >= MAX_LOGIN_ATTEMPTS
          ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000)
          : null;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: attempts >= MAX_LOGIN_ATTEMPTS ? 0 : attempts,
          lockedUntil,
        },
      });
      return {
        success: false,
        message: lockedUntil
          ? `Too many failed attempts. Account locked for ${LOCKOUT_MINUTES} minutes.`
          : "Invalid email or password.",
        redirectTo: null,
      };
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    await setAuthCookie(token);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    return {
      success: true,
      message: "Welcome back.",
      redirectTo: homePathForRole(user.role),
    };
  } catch {
    if (!allowDemoBypass()) {
      return {
        success: false,
        message: "Unable to sign in. Check database connection.",
        redirectTo: null,
      };
    }

    const demoUsers: { email: string; password: string; role: Role; name: string }[] = [
      {
        email: process.env.ADMIN_EMAIL || "admin@gizebarandrestaurant.com",
        password: process.env.ADMIN_PASSWORD || "GizeAdmin2024!",
        role: "SUPER_ADMIN",
        name: "Gize Super Admin",
      },
      {
        email: process.env.RESERVATION_EMAIL || "reservations@gizebarandrestaurant.com",
        password: process.env.RESERVATION_PASSWORD || "GizeReserve2024!",
        role: "RESERVATION_MANAGER",
        name: "Reservation Manager",
      },
      {
        email: process.env.EDITOR_EMAIL || "editor@gizebarandrestaurant.com",
        password: process.env.EDITOR_PASSWORD || "GizeEditor2024!",
        role: "CONTENT_EDITOR",
        name: "Content Editor",
      },
    ];

    const match = demoUsers.find(
      (u) =>
        parsed.data.email.toLowerCase() === u.email.toLowerCase() &&
        parsed.data.password === u.password
    );

    if (match) {
      const token = await createToken({
        userId: `demo-${match.role.toLowerCase()}`,
        email: match.email,
        name: match.name,
        role: match.role,
      });
      await setAuthCookie(token);
      return {
        success: true,
        message: "Welcome back (demo mode).",
        redirectTo: homePathForRole(match.role),
      };
    }

    return {
      success: false,
      message: "Unable to sign in. Check database connection.",
      redirectTo: null,
    };
  }
}

export async function logoutAction() {
  await clearAuthCookie();
  redirect("/login");
}

export async function ensureDemoAdmin() {
  const email = (process.env.ADMIN_EMAIL || "admin@gizebarandrestaurant.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "GizeAdmin2024!";
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return;
    await prisma.user.create({
      data: {
        email,
        name: "Gize Super Admin",
        passwordHash: await hashPassword(password),
        role: "SUPER_ADMIN",
        passwordChangedAt: new Date(),
      },
    });
  } catch {
    // ignore
  }
}
