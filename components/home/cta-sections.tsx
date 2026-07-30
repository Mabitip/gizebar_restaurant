import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/motion";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { INSTAGRAM_IMAGES, MEDIA } from "@/lib/media";

export function ReservationCta() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0">
        <Image
          src={MEDIA.ambiance.patioMural}
          alt=""
          fill
          quality={90}
          className="object-cover"
          sizes="100vw"
        />
      </div>
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative mx-auto max-w-3xl px-4 text-center text-white">
        <FadeIn>
          <p className="eyebrow text-primary">Reservations</p>
          <h2 className="section-title mt-3 text-white">Your table is waiting</h2>
          <p className="mt-4 text-white/70">
            Secure your evening at Gize — intimate dinners, celebrations, and nights out
            that linger long after the last pour.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/reservations">Book a Table</Link>
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}

export function NewsletterSection() {
  return (
    <section className="section-padding border-y border-border bg-background">
      <div className="mx-auto max-w-xl px-4 text-center">
        <FadeIn>
          <p className="eyebrow">Stay Connected</p>
          <h2 className="section-title mt-3 text-foreground">Join the Gize list</h2>
          <p className="mt-4 text-muted">
            Seasonal menus, live nights, and exclusive invitations — delivered with care.
          </p>
          <div className="mt-8">
            <NewsletterForm />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export function InstagramFeed() {
  return (
    <section className="section-padding bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center">
          <p className="eyebrow">Instagram</p>
          <h2 className="section-title mt-3 text-foreground">@gizebarandrestaurant</h2>
        </FadeIn>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-6">
          {INSTAGRAM_IMAGES.map((src) => (
            <a
              key={src}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-2xl"
            >
              <Image
                src={src}
                alt="Gize Instagram moment"
                fill
                quality={90}
                className="object-cover transition duration-500 group-hover:scale-110"
                sizes="(max-width:768px) 50vw, 16vw"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MapSection() {
  const mapSrc =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL ||
    "https://maps.google.com/maps?q=Bole%20Addis%20Ababa%20Mega%20Building&t=&z=15&ie=UTF8&iwloc=&output=embed";

  return (
    <section className="pb-0">
      <div className="h-[420px] w-full">
        <iframe
          title="Gize Bar & Restaurant on Google Maps"
          src={mapSrc}
          className="h-full w-full border-0 grayscale-[30%]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </section>
  );
}
