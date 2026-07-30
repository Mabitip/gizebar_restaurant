import { redirect } from "next/navigation";
import { AdminCharts } from "@/components/admin/charts";
import { prisma } from "@/lib/prisma";
import { SEED_EVENTS, SEED_GALLERY, SEED_MENU } from "@/lib/seed-data";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/permissions";

export default async function AdminAnalyticsPage() {
  const session = await getSession();
  if (!session || !can(session, "analytics")) redirect("/admin");

  let menu = SEED_MENU.length;
  let reservations = 0;
  let events = SEED_EVENTS.length;
  let gallery = SEED_GALLERY.length;
  let activities: {
    id: string;
    action: string;
    entity: string;
    details: string | null;
    createdAt: Date;
  }[] = [];

  try {
    if (!(process.env.DATABASE_URL || "").includes("user:password@")) {
      [menu, reservations, events, gallery, activities] = await Promise.all([
        prisma.menuItem.count(),
        prisma.reservation.count(),
        prisma.event.count(),
        prisma.galleryItem.count(),
        prisma.activityLog.findMany({
          where:
            session.role === "SUPER_ADMIN"
              ? undefined
              : { userId: session.userId },
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
      ]);
    }
  } catch {
    // fallbacks
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl">Analytics</h2>
        <p className="text-sm text-muted">Content volume and recent admin activity.</p>
      </div>
      <AdminCharts menu={menu} reservations={reservations} events={events} gallery={gallery} />
      <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
        <h3 className="font-heading text-xl">Recent Activity</h3>
        <ul className="mt-4 space-y-3 text-sm">
          {activities.length === 0 && <li className="text-muted">No activity logged yet.</li>}
          {activities.map((a) => (
            <li key={a.id} className="flex justify-between gap-4 border-b border-border/60 pb-2">
              <span>
                <strong>{a.action}</strong> {a.entity}
                {a.details ? ` — ${a.details}` : ""}
              </span>
              <span className="shrink-0 text-muted">
                {new Date(a.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
