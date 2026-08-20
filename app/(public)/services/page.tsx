import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/motion";
import { MEDIA } from "@/lib/media";
import { SITE } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Services",
  description: `Explore services from ${SITE.name} — premium catering and guest experiences in Addis Ababa.`,
};

const SERVICES = [
  {
    href: "/services/catering",
    title: "Catering",
    eyebrow: "Off-site & private dining",
    description:
      "Full-service catering for weddings, corporate events, graduations, and intimate celebrations — plated with Gize precision.",
    image: MEDIA.food.buffetEthiopian,
  },
  {
    href: "/testimonials",
    title: "Guest Stories",
    eyebrow: "Testimonials",
    description:
      "Hear from families, teams, and night-out regulars who make Gize their home away from home.",
    image: MEDIA.ambiance.patioMural,
  },
] as const;

export default function ServicesPage() {
  return (
    <div className="pt-20">
      <section className="relative flex min-h-[45vh] items-center justify-center overflow-hidden">
        <Image
          src={MEDIA.events.chefs}
          alt="Gize catering service"
          fill
          priority
          quality={90}
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        <div className="relative z-10 px-4 text-center text-white">
          <p className="eyebrow text-primary">Services</p>
          <h1 className="mt-3 font-heading text-5xl md:text-6xl">Crafted for every occasion</h1>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            From catering tables that impress to nights guests still talk about.
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Stagger className="grid gap-8 lg:grid-cols-2">
            {SERVICES.map((service) => (
              <StaggerItem key={service.href}>
                <Link
                  href={service.href}
                  className="group relative block overflow-hidden rounded-3xl"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      quality={90}
                      className="object-cover transition duration-700 group-hover:scale-105"
                      sizes="(max-width:1024px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                    <p className="text-xs uppercase tracking-[0.3em] text-primary">
                      {service.eyebrow}
                    </p>
                    <h2 className="mt-2 font-heading text-3xl md:text-4xl">{service.title}</h2>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80">
                      {service.description}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white transition group-hover:gap-3">
                      Explore
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>

          <FadeIn className="mt-16 text-center">
            <Button asChild size="lg">
              <Link href="/services/catering">Request Catering</Link>
            </Button>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
