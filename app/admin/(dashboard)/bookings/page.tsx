import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { BookingsManager } from "@/components/admin/crud-managers";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const session = await getSession();
  if (!session || !can(session, "eventBookings")) redirect("/admin");

  let items: Awaited<
    ReturnType<
      typeof prisma.eventBooking.findMany<{ include: { event: { select: { title: true } } } }>
    >
  > = [];
  try {
    if (!(process.env.DATABASE_URL || "").includes("user:password@")) {
      items = await prisma.eventBooking.findMany({
        include: { event: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
      });
    }
  } catch {
    items = [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl">Event Bookings</h2>
        <p className="mt-1 text-sm text-muted">Inquiries and RSVPs for events.</p>
      </div>
      <BookingsManager items={items} />
    </div>
  );
}
