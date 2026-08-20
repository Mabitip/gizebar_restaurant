"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { newsletterSchema, type NewsletterInput } from "@/lib/validations";

function allowSoftSuccess() {
  return process.env.ALLOW_DEMO_AUTH === "true" && process.env.NODE_ENV !== "production";
}

export async function subscribeNewsletter(input: NewsletterInput) {
  const parsed = newsletterSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Please enter a valid email." };
  }

  const h = await headers();
  const ip = clientIpFromHeaders(h);
  const limited = rateLimit(`newsletter:${ip}`, 5, 60_000);
  if (!limited.success) {
    return { success: false, message: "Too many attempts. Please try again later." };
  }

  try {
    await prisma.newsletter.upsert({
      where: { email: parsed.data.email.toLowerCase() },
      update: { isActive: true },
      create: { email: parsed.data.email.toLowerCase() },
    });
    return { success: true, message: "Welcome to the Gize circle." };
  } catch (e) {
    console.error("subscribeNewsletter failed", e);
    if (allowSoftSuccess()) {
      return { success: true, message: "Welcome to the Gize circle." };
    }
    return { success: false, message: "Could not subscribe right now. Please try again." };
  }
}
