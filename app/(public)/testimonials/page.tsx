import type { Metadata } from "next";
import { Star } from "lucide-react";
import { getTestimonials } from "@/lib/data";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/motion";

export const metadata: Metadata = {
  title: "Testimonials",
  description: "Guest reviews and experiences at Gize Bar & Restaurant.",
};

export default async function TestimonialsPage() {
  const items = await getTestimonials();

  return (
    <div className="section-padding pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Testimonials</p>
          <h1 className="section-title mt-3">What our guests say</h1>
          <p className="mt-4 text-muted">
            Stories from diners, planners, and travelers who made Gize part of their night.
          </p>
        </FadeIn>
        <Stagger className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <StaggerItem key={item.id}>
              <article className="glass-card h-full rounded-2xl p-8">
                <div className="flex gap-1">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="mt-4 text-muted leading-relaxed">
                  &ldquo;{item.content}&rdquo;
                </p>
                <div className="mt-6">
                  <p className="font-heading text-xl text-foreground">{item.name}</p>
                  {item.role && <p className="text-sm text-muted">{item.role}</p>}
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </div>
  );
}
