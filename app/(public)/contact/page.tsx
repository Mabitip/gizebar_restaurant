import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { OPENING_HOURS, SITE } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${SITE.name} — phone, email, map, and inquiry form. Located in Bole, behind Mega Building.`,
};

export default function ContactPage() {
  const mapSrc =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL ||
    "https://maps.google.com/maps?q=Bole%20Addis%20Ababa%20Mega%20Building&t=&z=15&ie=UTF8&iwloc=&output=embed";

  return (
    <div className="section-padding pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Contact</p>
          <h1 className="section-title mt-3">We&apos;d love to hear from you</h1>
        </div>
        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="glass-card space-y-5 rounded-2xl p-8">
              <div className="flex gap-3">
                <MapPin className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{SITE.address}</p>
                  <p className="font-ethiopic text-sm text-muted">{SITE.addressAm}</p>
                  <p className="text-sm text-muted">
                    {SITE.city}, {SITE.country}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <a href={`tel:${SITE.phoneRaw}`} className="hover:text-primary">
                  {SITE.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <a href={`mailto:${SITE.email}`} className="hover:text-primary">
                  {SITE.email}
                </a>
              </div>
              <div className="border-t border-border pt-5">
                <p className="mb-3 font-heading text-lg">Business Hours</p>
                {OPENING_HOURS.map((row) => (
                  <div key={row.day} className="flex justify-between py-1 text-sm">
                    <span>{row.day}</span>
                    <span className="text-muted">{row.hours}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-black/5">
              <iframe
                title="Map"
                src={mapSrc}
                className="h-64 w-full"
                loading="lazy"
              />
            </div>
          </div>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
