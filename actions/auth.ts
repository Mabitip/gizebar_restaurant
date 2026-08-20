"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  clearAuthCookie,
  createToken,
  LOCKOUT_MINUTES,
  MAX_LOGIN_ATTEMPTS,
  setAuthCookie,
  verifyPassword,
} from "@/lib/auth";
import { homePathForRole } from "@/lib/permissions";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { headers } from "next/headers";
import type { Role } from "@prisma/client";

function allowDemoAuth() {
  return process.env.ALLOW_DEMO_AUTH === "true" && process.env.NODE_ENV !== "production";
}

export async function loginAction(input: LoginInput) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Invalid credentials.", redirectTo: null as string | null };
  }

  const h = await headers();
  const ip = clientIpFromHeaders(h);
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
    if (!allowDemoAuth()) {
      return {
        success: false,
        message: "Unable to sign in. Try again.",
        redirectTo: null,
      };
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const reservationEmail = process.env.RESERVATION_EMAIL;
    const reservationPassword = process.env.RESERVATION_PASSWORD;
    const editorEmail = process.env.EDITOR_EMAIL;
    const editorPassword = process.env.EDITOR_PASSWORD;

    const demoUsers: { email: string; password: string; role: Role; name: string }[] = [];
    if (adminEmail && adminPassword) {
      demoUsers.push({
        email: adminEmail,
        password: adminPassword,
        role: "SUPER_ADMIN",
        name: "Gize Super Admin",
      });
    }
    if (reservationEmail && reservationPassword) {
      demoUsers.push({
        email: reservationEmail,
        password: reservationPassword,
        role: "RESERVATION_MANAGER",
        name: "Reservation Manager",
      });
    }
    if (editorEmail && editorPassword) {
      demoUsers.push({
        email: editorEmail,
        password: editorPassword,
        role: "CONTENT_EDITOR",
        name: "Content Editor",
      });
    }

    const match = demoUsers.find(
      (u) =>
        parsed.data.email.toLowerCase() === u.email.toLowerCase() &&
        parsed.data.password === u.password
    );

    if (match) {
      const token = await createToken({
        userId: `demo-${match.role.toLowerCase()}`,
        email: match.email.toLowerCase(),
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
      message: "Unable to sign in. Try again.",
      redirectTo: null,
    };
  }
}

export async function logoutAction() {
  await clearAuthCookie();
  redirect("/login");
}
