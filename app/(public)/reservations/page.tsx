import type { Metadata } from "next";
import { ReservationForm } from "@/components/forms/reservation-form";
import { OPENING_HOURS, SITE } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Reservations",
  description: `Reserve your table at ${SITE.name}. Online reservations for lunch, dinner, and special occasions in Bole, Addis Ababa.`,
};

export default function ReservationsPage() {
  return (
    <div className="section-padding pt-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-2 sm:px-6 lg:px-8">
        <div>
          <p className="eyebrow">Reservations</p>
          <h1 className="section-title mt-3">Book your table</h1>
          <p className="mt-4 text-muted leading-relaxed">
            Join us for lunch, dinner, or a late-night cocktail. Large parties and
            special occasions are welcome — share details in your request and we&apos;ll
            tailor the evening.
          </p>
          <div className="mt-8 space-y-4 rounded-2xl border border-border bg-surface p-6 text-foreground">
            <h2 className="font-heading text-xl">Opening Hours</h2>
            {OPENING_HOURS.map((row) => (
              <div key={row.day} className="flex justify-between gap-4 text-sm">
                <span>{row.day}</span>
                <span className="text-muted">{row.hours}</span>
              </div>
            ))}
            <p className="pt-2 text-sm text-muted">
              Prefer to call?{" "}
              <a className="text-primary hover:underline" href={`tel:${SITE.phoneRaw}`}>
                {SITE.phone}
              </a>
            </p>
          </div>
        </div>
        <ReservationForm />
      </div>
    </div>
  );
}
