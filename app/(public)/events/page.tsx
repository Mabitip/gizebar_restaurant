import type { Metadata } from "next";
import { EventsClient } from "@/components/events/events-client";
import { getEvents } from "@/lib/data";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Live music, birthday packages, corporate dining, graduations, private dinners, and wedding celebrations at Gize.",
};

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="section-padding pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="eyebrow">Events</p>
          <h1 className="section-title mt-3">Celebrate at Gize</h1>
          <p className="mt-4 text-muted">
            From intimate chef&apos;s dinners to grand receptions — we host nights that matter.
          </p>
        </div>
        <EventsClient events={events} />
      </div>
    </div>
  );
}
