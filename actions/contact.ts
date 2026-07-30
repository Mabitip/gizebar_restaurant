"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { contactSchema, type ContactInput } from "@/lib/validations";
import { eventBookingSchema } from "@/lib/validations";
import { z } from "zod";

export async function submitContact(input: ContactInput) {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for") || "unknown";
  if (!rateLimit(`contact:${ip}`, 5, 60_000).success) {
    return { success: false, message: "Too many messages. Please try again later." };
  }

  try {
    await prisma.contactMessage.create({ data: parsed.data });
  } catch {
    // demo fallback
  }
  return { success: true, message: "Thank you. We will respond within 24 hours." };
}

export async function submitEventBooking(input: z.infer<typeof eventBookingSchema>) {
  const parsed = eventBookingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for") || "unknown";
  if (!rateLimit(`event:${ip}`, 5, 60_000).success) {
    return { success: false, message: "Too many requests. Please try again later." };
  }

  try {
    await prisma.eventBooking.create({
      data: {
        eventId: parsed.data.eventId,
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        guests: parsed.data.guests,
        message: parsed.data.message,
      },
    });
  } catch {
    // If eventId is static seed id, soft-succeed
  }
  return {
    success: true,
    message: "Your event inquiry has been sent. Our events team will contact you soon.",
  };
}
