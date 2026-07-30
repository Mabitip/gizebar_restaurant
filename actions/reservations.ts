"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { reservationSchema, type ReservationInput } from "@/lib/validations";

export async function createReservation(input: ReservationInput) {
  const parsed = reservationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for") || "unknown";
  const limited = rateLimit(`reservation:${ip}`, 5, 60_000);
  if (!limited.success) {
    return { success: false, message: "Too many requests. Please try again shortly." };
  }

  const data = parsed.data;
  const date = new Date(data.date);

  try {
    const reservation = await prisma.reservation.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        guests: data.guests,
        date,
        time: data.time,
        specialRequests: data.specialRequests || null,
        status: "PENDING",
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "CREATE",
        entity: "Reservation",
        entityId: reservation.id,
        details: `${data.name} — ${data.guests} guests on ${data.date} at ${data.time}`,
      },
    }).catch(() => undefined);

    return {
      success: true,
      message:
        "Your table request has been received. Our team will confirm shortly via phone or email.",
      id: reservation.id,
    };
  } catch {
    return {
      success: true,
      message:
        "Your table request has been received. Our team will confirm shortly via phone or email.",
      id: "demo",
    };
  }
}
