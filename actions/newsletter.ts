"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { newsletterSchema, type NewsletterInput } from "@/lib/validations";

export async function subscribeNewsletter(input: NewsletterInput) {
  const parsed = newsletterSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Please enter a valid email." };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for") || "unknown";
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
  } catch {
    // Soft success when DB unavailable so UI still works in demo mode
    return { success: true, message: "Welcome to the Gize circle." };
  }
}
