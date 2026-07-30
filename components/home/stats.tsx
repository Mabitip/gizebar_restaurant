"use client";

import { AnimatedCounter, FadeIn } from "@/components/ui/motion";
import { STATS } from "@/lib/seed-data";

export function StatsSection() {
  return (
    <section
      id="stats"
      className="relative border-y border-border bg-surface py-16 text-foreground"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(215,1,2,0.08),_transparent_65%)]" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 md:grid-cols-4 sm:px-6 lg:px-8">
        {STATS.map((stat, i) => (
          <FadeIn key={stat.label} delay={i * 0.1} className="text-center">
            <AnimatedCounter
              value={stat.value}
              suffix={stat.value >= 1000 ? "+" : "+"}
              className="font-heading text-4xl text-primary md:text-5xl"
            />
            <p className="mt-2 text-xs uppercase tracking-[0.25em] text-muted">
              {stat.label}
            </p>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
