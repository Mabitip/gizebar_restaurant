import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { EventsManager } from "@/components/admin/crud-managers";
import { SEED_EVENTS } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const session = await getSession();
  if (!session || !can(session, "events")) redirect("/admin");

  let events: Awaited<ReturnType<typeof prisma.event.findMany>> = [];
  try {
    if (!(process.env.DATABASE_URL || "").includes("user:password@")) {
      events = await prisma.event.findMany({ orderBy: { startDate: "asc" } });
    }
  } catch {
    events = [];
  }

  const rows =
    events.length > 0
      ? events
      : SEED_EVENTS.map((e, i) => {
          const start = new Date();
          start.setDate(start.getDate() + e.daysAhead);
          return {
            id: `seed-event-${i}`,
            title: e.title,
            description: e.description,
            shortDesc: e.shortDesc,
            image: e.image,
            category: e.category,
            startDate: start,
            status: "PUBLISHED",
            isFeatured: e.isFeatured,
            price: e.price,
            capacity: e.capacity,
          };
        });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl">Events</h2>
        <p className="mt-1 text-sm text-muted">Create and publish venue events.</p>
      </div>
      <EventsManager events={rows} />
    </div>
  );
}
