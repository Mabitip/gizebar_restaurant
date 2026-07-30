import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/motion";

type EventItem = {
  id: string;
  title: string;
  slug: string;
  shortDesc: string | null;
  description: string;
  image: string | null;
  startDate: Date;
  category: string;
  price: string | null;
};

export function EventsPreview({ events }: { events: EventItem[] }) {
  return (
    <section className="section-padding bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Events</p>
          <h2 className="section-title mt-3 text-foreground">Nights worth dressing for</h2>
          <p className="mt-4 text-muted">
            Live music, private dinners, and celebration packages tailored to you.
          </p>
        </FadeIn>
        <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
          {events.slice(0, 3).map((event) => (
            <StaggerItem key={event.id}>
              <article className="glass-card group overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:shadow-xl">
                <div className="relative aspect-[16/10] overflow-hidden">
                  {event.image && (
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-110"
                      sizes="(max-width:768px) 100vw, 33vw"
                    />
                  )}
                </div>
                <div className="space-y-3 p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-primary">
                    {format(new Date(event.startDate), "MMM d, yyyy")} · {event.category}
                  </p>
                  <h3 className="font-heading text-2xl text-foreground">{event.title}</h3>
                  <p className="line-clamp-2 text-sm text-muted">
                    {event.shortDesc || event.description}
                  </p>
                  {event.price && (
                    <p className="text-sm font-medium text-foreground">{event.price}</p>
                  )}
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
        <div className="mt-10 text-center">
          <Button asChild>
            <Link href="/events">Explore Events</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
