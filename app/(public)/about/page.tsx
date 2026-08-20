import type { Metadata } from "next";
import Image from "next/image";
import { Building2, Calendar, MapPin, Quote } from "lucide-react";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/motion";
import { getTeam } from "@/lib/data";
import { MEDIA } from "@/lib/media";
import { ABOUT, SITE } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description: `Discover the story behind ${SITE.name} — luxury dining, Ethiopian heritage, and refined hospitality in Bole, Addis Ababa.`,
};

const COMPANY_FACTS = [
  {
    icon: Building2,
    label: "Company Name",
    value: ABOUT.companyName,
  },
  {
    icon: Calendar,
    label: "Established in",
    value: ABOUT.established,
  },
  {
    icon: MapPin,
    label: "Address",
    value: ABOUT.address,
  },
  {
    icon: Quote,
    label: "Motto",
    value: `“${ABOUT.motto}”`,
  },
] as const;

export default async function AboutPage() {
  const team = await getTeam();

  return (
    <div className="pt-20">
      <section className="relative flex min-h-[50vh] items-center justify-center overflow-hidden">
        <Image
          src={MEDIA.ambiance.brandSign}
          alt="Gize restaurant exterior"
          fill
          quality={90}
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative z-10 px-4 text-center text-white">
          <p className="eyebrow text-primary">About Us</p>
          <h1 className="mt-3 font-heading text-5xl md:text-6xl">Our Story</h1>
          <p className="mt-4 font-heading text-xl italic text-primary sm:text-2xl">
            “{ABOUT.motto}”
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-2 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="eyebrow">Welcome to Gize</p>
            <h2 className="section-title mt-3 text-foreground">
              From breakfast to late-night celebrations
            </h2>
            <p className="mt-6 leading-relaxed text-muted">
              Gize Bar and Restaurant is the perfect choice to enjoy breakfast, lunch, dinner
              and anything in between with friends and family. The diverse menu covers a range
              of preferences with fantastic flavors and delicious Ethiopian and International
              cuisines.
            </p>
            <p className="mt-4 leading-relaxed text-muted">
              After dinner, why not enjoy a tasty cocktail, wine, beer or a specialty Ethiopian
              coffee, latte or tea in Gize bar and café. With a relaxed atmosphere, our bar and
              restaurant is perfect for meeting with friends, colleagues or family members for
              coffee, drink or meal. The friendly and experienced staff will ensure your visit
              from breakfast to dinner are of the highest quality and standard available at
              Gize Bar &amp; Restaurant.
            </p>
            <p className="mt-4 leading-relaxed text-muted">
              Events whether it is a birthday party, a baby shower, engagement and wedding
              parties or a simple get-together with friends and families — Gize Bar &amp;
              Restaurant is your venue to make a special day extra special and memorable.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl">
              <Image
                src={MEDIA.food.ethiopianPlatter}
                alt="Ethiopian platter at Gize"
                fill
                quality={90}
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 50vw"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="section-padding bg-surface text-foreground">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center">
            <p className="eyebrow">Our Name</p>
            <h2 className="section-title mt-3 font-ethiopic text-foreground">
              “{ABOUT.nameStory.title}”
            </h2>
          </FadeIn>
          <div className="mt-12 space-y-12">
            {ABOUT.nameStory.sections.map((section) => (
              <FadeIn key={section.heading}>
                <h3 className="font-ethiopic text-2xl text-primary md:text-3xl">
                  “{section.heading}”
                </h3>
                <div className="mt-5 space-y-4 font-ethiopic text-base leading-loose text-muted md:text-lg">
                  {section.paragraphs.map((paragraph, index) => (
                    <p key={`${section.heading}-${index}`}>{paragraph}</p>
                  ))}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center">
            <p className="eyebrow">Who We Are</p>
            <h2 className="section-title mt-3 text-foreground">Company information</h2>
          </FadeIn>
          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {COMPANY_FACTS.map((fact) => {
              const Icon = fact.icon;
              return (
                <StaggerItem key={fact.label}>
                  <div className="glass-card h-full rounded-2xl p-6 text-center transition hover:-translate-y-1 hover:shadow-xl">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted">
                      {fact.label}
                    </p>
                    <p className="mt-3 font-heading text-lg leading-snug text-foreground">
                      {fact.value}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      <section className="section-padding bg-surface text-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center">
            <p className="eyebrow">Our Purpose</p>
            <h2 className="section-title mt-3 text-foreground">Vision &amp; Mission</h2>
          </FadeIn>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <FadeIn>
              <div className="glass-card h-full rounded-2xl p-8">
                <p className="eyebrow">Vision</p>
                <p className="mt-4 font-heading text-2xl leading-snug text-foreground">
                  {ABOUT.vision}
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="glass-card h-full rounded-2xl p-8">
                <p className="eyebrow">Mission</p>
                <p className="mt-4 text-base leading-relaxed text-muted">
                  {ABOUT.mission}
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="section-padding relative overflow-hidden bg-background text-foreground">
        <div className="absolute inset-0 luxury-gradient opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center">
            <p className="eyebrow">What Guides Us</p>
            <h2 className="section-title mt-3 text-foreground">Core Values</h2>
          </FadeIn>
          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ABOUT.values.map((value) => (
              <StaggerItem key={value.title}>
                <div className="glass-card h-full rounded-2xl p-6 transition hover:-translate-y-1 hover:shadow-xl">
                  <h3 className="font-heading text-xl text-foreground">{value.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {value.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="section-padding bg-surface text-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center">
            <p className="eyebrow">Our Team</p>
            <h2 className="section-title mt-3 text-foreground">The people behind the experience</h2>
          </FadeIn>
          <Stagger className="mt-12 grid gap-8 md:grid-cols-3">
            {team.map((member) => (
              <StaggerItem key={member.id}>
                <div className="text-center">
                  <div className="relative mx-auto mb-5 aspect-square w-48 overflow-hidden rounded-full">
                    {member.image && (
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <h3 className="font-heading text-2xl text-foreground">{member.name}</h3>
                  <p className="mt-1 text-sm text-primary">{member.role}</p>
                  {member.bio && (
                    <p className="mt-3 text-sm text-muted">{member.bio}</p>
                  )}
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </div>
  );
}
