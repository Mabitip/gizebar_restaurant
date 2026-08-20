import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  ChefHat,
  HeartHandshake,
  PartyPopper,
  Sparkles,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { Button } from "@/components/ui/button";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/motion";
import { MEDIA } from "@/lib/media";
import { SITE, phoneTel } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Catering",
  description: `Premium catering by ${SITE.name} — Ethiopian and international menus, full service, and fair pricing for weddings, corporate events, and celebrations in Addis Ababa.`,
};

const OCCASIONS = [
  {
    icon: HeartHandshake,
    title: "Weddings & Engagements",
    description:
      "Reception menus, live stations, and gracious service that honor your guests from first toast to last dance.",
  },
  {
    icon: Building2,
    title: "Corporate & Boardroom",
    description:
      "Executive lunches, product launches, and team dinners with punctual plating and polished presentation.",
  },
  {
    icon: PartyPopper,
    title: "Private Celebrations",
    description:
      "Birthdays, graduations, baby showers, and family gatherings styled with Gize warmth and precision.",
  },
  {
    icon: Users,
    title: "Community & Cultural Events",
    description:
      "Large-format Ethiopian platters and buffet service that celebrate heritage with generous hospitality.",
  },
] as const;

const PACKAGES = [
  {
    name: "Essential",
    tagline: "Refined simplicity",
    guests: "20 – 60 guests",
    featured: false,
    highlights: [
      "Curated Ethiopian or international set menu",
      "Professional service staff",
      "Setup & clearing",
      "Complimentary consultation",
    ],
  },
  {
    name: "Signature",
    tagline: "Our most requested",
    featured: true,
    guests: "60 – 150 guests",
    highlights: [
      "Custom multi-course or buffet design",
      "Live carving or injera stations",
      "Dedicated event captain",
      "Bar package coordination",
      "Table styling guidance",
    ],
  },
  {
    name: "Grand",
    tagline: "Uncompromising luxury",
    featured: false,
    guests: "150+ guests",
    highlights: [
      "Bespoke tasting & full planning",
      "Chef on-site presence",
      "Extended beverage programs",
      "Timeline & logistics management",
      "Priority scheduling",
    ],
  },
] as const;

const STEPS = [
  {
    step: "01",
    title: "Share your vision",
    description:
      "Tell us the date, guest count, venue, and the feeling you want your table to leave behind.",
  },
  {
    step: "02",
    title: "Taste & refine",
    description:
      "We craft a menu proposal — and when needed, a tasting — until every plate feels right.",
  },
  {
    step: "03",
    title: "We arrive prepared",
    description:
      "Our team handles transport, setup, service, and breakdown so you can host without worry.",
  },
] as const;

const PROMISES = [
  {
    icon: ChefHat,
    title: "Kitchen excellence",
    description: "The same standards as our dining room — quality ingredients, careful heat, beautiful plating.",
  },
  {
    icon: UtensilsCrossed,
    title: "Full-fledged service",
    description: "Servers, captains, and coordination that keep the evening flowing without friction.",
  },
  {
    icon: Sparkles,
    title: "Fair & transparent",
    description: "Clear packages, honest pricing, and menus designed for both delight and value.",
  },
] as const;

export default function CateringPage() {
  return (
    <div className="pt-20">
      <section className="relative flex min-h-[78vh] items-end overflow-hidden pb-16 md:min-h-[85vh] md:pb-24">
        <Image
          src={MEDIA.food.buffetEthiopian}
          alt="Gize catering buffet"
          fill
          priority
          quality={90}
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="eyebrow text-primary">Catering Service</p>
            <h1 className="mt-4 max-w-3xl font-heading text-5xl leading-[1.05] text-white sm:text-6xl md:text-7xl">
              Tables that feel like home — wherever you gather
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              Bring Gize to your venue. Ethiopian heritage plates, international classics, and
              full-service hospitality for weddings, corporate moments, and celebrations that matter.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg">
                <a href="#inquire">Request a Proposal</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 text-white">
                <a href={phoneTel()}>Call {SITE.phone}</a>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="relative border-y border-border bg-surface py-10">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 text-center sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { label: "Since", value: "2018" },
            { label: "Cuisine", value: "Ethiopian · International" },
            { label: "Promise", value: "“Home away Home”" },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">{item.label}</p>
              <p className="mt-2 font-heading text-2xl text-foreground md:text-3xl">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="eyebrow">Why Gize Catering</p>
            <h2 className="section-title mt-3 text-foreground">
              Quality food. Complete service. Fair price.
            </h2>
            <p className="mt-6 leading-relaxed text-muted">
              Our catering program extends the dining room beyond Kirkos and Bole — with the same
              commitment to healthy, flavorful cooking and attentive hospitality that defines Gize
              Bar and Restaurant.
            </p>
            <p className="mt-4 leading-relaxed text-muted">
              Whether you need an elegant plated dinner or a generous Ethiopian buffet, we plan
              every detail so your guests feel welcomed, well-fed, and remembered.
            </p>
          </FadeIn>
          <FadeIn delay={0.12}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl">
              <Image
                src={MEDIA.events.chefs}
                alt="Chefs preparing catering service"
                fill
                quality={90}
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 50vw"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="section-padding relative overflow-hidden bg-surface">
        <div className="absolute inset-0 luxury-gradient opacity-70" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Occasions</p>
            <h2 className="section-title mt-3 text-foreground">Made for your moment</h2>
          </FadeIn>
          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {OCCASIONS.map((item) => {
              const Icon = item.icon;
              return (
                <StaggerItem key={item.title}>
                  <div className="glass-card h-full rounded-2xl p-6 transition hover:-translate-y-1 hover:shadow-xl">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-heading text-xl text-foreground">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{item.description}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Packages</p>
            <h2 className="section-title mt-3 text-foreground">Choose your scale</h2>
            <p className="mt-4 text-muted">
              Every package is a starting point — we tailor menus, staffing, and flow to your venue.
            </p>
          </FadeIn>
          <Stagger className="mt-12 grid gap-6 lg:grid-cols-3">
            {PACKAGES.map((pkg) => (
              <StaggerItem key={pkg.name}>
                <div
                  className={
                    pkg.featured
                      ? "relative h-full rounded-3xl bg-inverse p-8 text-inverse-fg shadow-2xl ring-1 ring-primary/40"
                      : "glass-card h-full rounded-3xl p-8"
                  }
                >
                  {pkg.featured && (
                    <span className="absolute -top-3 left-8 rounded-full bg-primary px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white">
                      Most popular
                    </span>
                  )}
                  <p
                    className={
                      pkg.featured
                        ? "text-xs uppercase tracking-[0.3em] text-primary"
                        : "eyebrow"
                    }
                  >
                    {pkg.tagline}
                  </p>
                  <h3 className="mt-3 font-heading text-3xl">{pkg.name}</h3>
                  <p
                    className={
                      pkg.featured ? "mt-2 text-sm text-inverse-fg/70" : "mt-2 text-sm text-muted"
                    }
                  >
                    {pkg.guests}
                  </p>
                  <ul className="mt-8 space-y-3">
                    {pkg.highlights.map((line) => (
                      <li key={line} className="flex gap-3 text-sm leading-relaxed">
                        <CheckCircle2
                          className={
                            pkg.featured
                              ? "mt-0.5 h-4 w-4 shrink-0 text-primary"
                              : "mt-0.5 h-4 w-4 shrink-0 text-primary"
                          }
                        />
                        <span className={pkg.featured ? "text-inverse-fg/85" : "text-muted"}>
                          {line}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className={
                      pkg.featured
                        ? "mt-8 w-full bg-white text-primary hover:bg-primary hover:text-white"
                        : "mt-8 w-full"
                    }
                  >
                    <a href="#inquire">Inquire</a>
                  </Button>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="section-padding relative overflow-hidden bg-surface">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-[1.1fr_0.9fr] sm:px-6 lg:px-8">
          <div>
            <FadeIn>
              <p className="eyebrow">The Menu Lens</p>
              <h2 className="section-title mt-3 text-foreground">Flavors guests remember</h2>
            </FadeIn>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Ethiopian platters",
                  image: MEDIA.food.ethiopianPlatter,
                  copy: "Shared injera boards, berbere-rich stews, and vegetarian spreads.",
                },
                {
                  title: "Live & buffet",
                  image: MEDIA.food.buffetPasta,
                  copy: "Stations and buffets built for flow, abundance, and conversation.",
                },
                {
                  title: "Signature mains",
                  image: MEDIA.food.sizzling,
                  copy: "Sizzling specialties and plated courses for formal dinners.",
                },
                {
                  title: "Bar & coffee",
                  image: MEDIA.drinks.cocktails,
                  copy: "Cocktails, wine, and Ethiopian coffee ceremonies on request.",
                },
              ].map((card, i) => (
                <FadeIn key={card.title} delay={i * 0.05}>
                  <div className="overflow-hidden rounded-2xl border border-border bg-background">
                    <div className="relative aspect-[16/10]">
                      <Image
                        src={card.image}
                        alt={card.title}
                        fill
                        className="object-cover"
                        sizes="(max-width:640px) 100vw, 25vw"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-heading text-xl text-foreground">{card.title}</h3>
                      <p className="mt-2 text-sm text-muted">{card.copy}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
          <FadeIn delay={0.1} className="flex flex-col justify-center">
            <div className="glass-card rounded-3xl p-8">
              <p className="eyebrow">Our promise</p>
              <div className="mt-8 space-y-6">
                {PROMISES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-heading text-lg text-foreground">{item.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button asChild className="mt-8 w-full" variant="outline">
                <Link href="/menu">Browse restaurant menu</Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Process</p>
            <h2 className="section-title mt-3 text-foreground">From inquiry to applause</h2>
          </FadeIn>
          <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((item) => (
              <StaggerItem key={item.step}>
                <div className="relative h-full rounded-3xl border border-border bg-surface p-8">
                  <span className="font-heading text-5xl text-primary/25">{item.step}</span>
                  <h3 className="mt-4 font-heading text-2xl text-foreground">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{item.description}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section id="inquire" className="section-padding relative overflow-hidden bg-surface">
        <div className="absolute inset-0 luxury-gradient" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-2 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="eyebrow">Inquire</p>
            <h2 className="section-title mt-3 text-foreground">
              Let’s plan your next table
            </h2>
            <p className="mt-6 leading-relaxed text-muted">
              Share your date, guest count, and venue. Our team will respond with availability and
              a tailored proposal. Prefer to talk now? Call{" "}
              <a className="text-primary hover:underline" href={phoneTel()}>
                {SITE.phone}
              </a>{" "}
              or write{" "}
              <a className="text-primary hover:underline" href={`mailto:${SITE.email}`}>
                {SITE.email}
              </a>
              .
            </p>
            <div className="mt-8 overflow-hidden rounded-3xl">
              <div className="relative aspect-[16/10]">
                <Image
                  src={MEDIA.events.celebration}
                  alt="Celebration at Gize"
                  fill
                  className="object-cover"
                  sizes="(max-width:1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <ContactForm />
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
