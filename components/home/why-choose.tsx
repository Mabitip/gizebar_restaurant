import { Award, GlassWater, MapPinned, Sparkles } from "lucide-react";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/motion";
import { WHY_CHOOSE_US } from "@/lib/seed-data";

const icons = [Award, GlassWater, Sparkles, MapPinned];

export function WhyChooseUs() {
  return (
    <section className="section-padding relative overflow-hidden bg-background">
      <div className="absolute inset-0 luxury-gradient" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Why Choose Us</p>
          <h2 className="section-title mt-3 text-foreground">The Gize difference</h2>
        </FadeIn>
        <Stagger className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {WHY_CHOOSE_US.map((item, i) => {
            const Icon = icons[i]!;
            return (
              <StaggerItem key={item.title}>
                <div className="glass-card h-full rounded-2xl p-6 transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading text-xl text-foreground">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {item.description}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
