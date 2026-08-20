"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { contactSchema, eventBookingSchema, type ContactInput } from "@/lib/validations";
import { z } from "zod";

function allowSoftSuccess() {
  return process.env.ALLOW_DEMO_AUTH === "true" && process.env.NODE_ENV !== "production";
}

export async function submitContact(input: ContactInput) {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const h = await headers();
  const ip = clientIpFromHeaders(h);
  if (!rateLimit(`contact:${ip}`, 5, 60_000).success) {
    return { success: false, message: "Too many messages. Please try again later." };
  }

  try {
    await prisma.contactMessage.create({ data: parsed.data });
    return { success: true, message: "Thank you. We will respond within 24 hours." };
  } catch (e) {
    console.error("submitContact failed", e);
    if (allowSoftSuccess()) {
      return { success: true, message: "Thank you. We will respond within 24 hours." };
    }
    return { success: false, message: "Could not send your message. Please try again." };
  }
}

export async function submitEventBooking(input: z.infer<typeof eventBookingSchema>) {
  const parsed = eventBookingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const h = await headers();
  const ip = clientIpFromHeaders(h);
  if (!rateLimit(`event:${ip}`, 5, 60_000).success) {
    return { success: false, message: "Too many requests. Please try again later." };
  }

  try {
    const event = await prisma.event.findFirst({
      where: { id: parsed.data.eventId, status: "PUBLISHED" },
      select: { id: true },
    });
    if (!event) {
      return { success: false, message: "That event is not available for booking." };
    }

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
    return {
      success: true,
      message: "Your event inquiry has been sent. Our events team will contact you soon.",
    };
  } catch (e) {
    console.error("submitEventBooking failed", e);
    if (allowSoftSuccess()) {
      return {
        success: true,
        message: "Your event inquiry has been sent. Our events team will contact you soon.",
      };
    }
    return { success: false, message: "Could not send your inquiry. Please try again." };
  }
}
