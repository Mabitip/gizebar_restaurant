import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/motion";
import { MEDIA } from "@/lib/media";

export function AboutPreview() {
  return (
    <section className="section-padding relative overflow-hidden bg-background">
      <div className="absolute inset-0 luxury-gradient opacity-60" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl">
            <Image
              src={MEDIA.ambiance.patioBrick}
              alt="Gize Bar & Restaurant dining ambiance"
              fill
              quality={90}
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        </FadeIn>
        <FadeIn delay={0.15} direction="left">
          <p className="eyebrow">Our Story</p>
          <h2 className="section-title mt-3 text-foreground">
            A sanctuary of taste in the heart of Bole
          </h2>
          <p className="mt-6 text-muted leading-relaxed">
            Gize Bar & Restaurant was born from a desire to elevate Addis Ababa&apos;s
            dining culture — pairing the warmth of Ethiopian hospitality with the
            precision of international fine dining. Behind Mega Building, our rooms
            glow with soft light, the bar hums with craft cocktails, and every plate
            tells a story of place and craft.
          </p>
          <p className="mt-4 text-muted leading-relaxed">
            Whether you join us for a leisurely lunch, a celebratory dinner, or a night
            of live music, Gize is designed to feel cinematic, intimate, and unforgettable.
          </p>
          <Button asChild className="mt-8">
            <Link href="/about">Discover Our Story</Link>
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}
