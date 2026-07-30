import { prisma } from "@/lib/prisma";
import {
  SEED_CATEGORIES,
  SEED_EVENTS,
  SEED_GALLERY,
  SEED_MENU,
  SEED_TEAM,
  SEED_TESTIMONIALS,
} from "@/lib/seed-data";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { AdminCharts } from "@/components/admin/charts";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function safeCount(fn: () => Promise<number>, fallback: number) {
  try {
    if ((process.env.DATABASE_URL || "").includes("user:password@")) return fallback;
    return await fn();
  } catch {
    return fallback;
  }
}

export default async function AdminOverviewPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [menuCount, reservationCount, eventCount, galleryCount, newsletterCount, contactCount, recentReservations] =
    await Promise.all([
      safeCount(() => prisma.menuItem.count(), SEED_MENU.length),
      safeCount(() => prisma.reservation.count(), 0),
      safeCount(() => prisma.event.count(), SEED_EVENTS.length),
      safeCount(() => prisma.galleryItem.count(), SEED_GALLERY.length),
      safeCount(() => prisma.newsletter.count(), 0),
      safeCount(() => prisma.contactMessage.count({ where: { status: "NEW" } }), 0),
      (async () => {
        try {
          return await prisma.reservation.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
          });
        } catch {
          return [];
        }
      })(),
    ]);

  const cards = [
    can(session, "menu") && { label: "Menu Items", value: menuCount },
    can(session, "reservations") && { label: "Reservations", value: reservationCount },
    can(session, "events") && { label: "Events", value: eventCount },
    can(session, "gallery") && { label: "Gallery", value: galleryCount },
    can(session, "newsletter") && { label: "Subscribers", value: newsletterCount },
    can(session, "contacts") && { label: "New Contacts", value: contactCount },
    can(session, "testimonials") && {
      label: "Testimonials",
      value: SEED_TESTIMONIALS.length,
    },
    can(session, "categories") && {
      label: "Categories",
      value: SEED_CATEGORIES.length,
    },
    can(session, "team") && { label: "Team", value: SEED_TEAM.length },
  ].filter(Boolean) as { label: string; value: number }[];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-3xl">Overview</h2>
        <p className="mt-1 text-sm text-muted">
          Role-scoped snapshot for your Gize dashboard.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-border bg-background p-6 shadow-sm"
          >
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-2 font-heading text-4xl text-primary">{card.value}</p>
          </div>
        ))}
      </div>
      {can(session, "analytics") && (
        <AdminCharts
          menu={menuCount}
          reservations={reservationCount}
          events={eventCount}
          gallery={galleryCount}
        />
      )}
      {can(session, "reservations") && (
        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
          <h3 className="font-heading text-xl">Recent Reservations</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-muted">
                <tr>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Guests</th>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Time</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentReservations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-muted">
                      No reservations yet.
                    </td>
                  </tr>
                )}
                {recentReservations.map((r) => (
                  <tr key={r.id} className="border-b border-border/60">
                    <td className="py-3 pr-4 font-medium">{r.name}</td>
                    <td className="py-3 pr-4">{r.guests}</td>
                    <td className="py-3 pr-4">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="py-3 pr-4">{r.time}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
