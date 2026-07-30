"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Quote, Star } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";

type Testimonial = {
  id: string;
  name: string;
  role: string | null;
  content: string;
  rating: number;
};

export function TestimonialsCarousel({ items }: { items: Testimonial[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    const id = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => {
      clearInterval(id);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="section-padding relative overflow-hidden bg-surface text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(215,1,2,0.06),_transparent_55%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Testimonials</p>
          <h2 className="section-title mt-3 text-foreground">Voices from our table</h2>
        </FadeIn>
        <div className="mt-12 overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {items.map((item) => (
              <div
                key={item.id}
                className="min-w-0 shrink-0 grow-0 basis-full px-2 md:basis-1/2 lg:basis-1/3"
              >
                <div className="glass-card flex h-full flex-col rounded-2xl p-8">
                  <Quote className="h-8 w-8 text-primary/80" />
                  <p className="mt-4 flex-1 text-muted leading-relaxed">
                    &ldquo;{item.content}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-1">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <div className="mt-4">
                    <p className="font-heading text-xl text-foreground">{item.name}</p>
                    {item.role && (
                      <p className="text-sm text-muted">{item.role}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex justify-center gap-2">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Go to testimonial ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                selected === i ? "w-8 bg-primary" : "w-2 bg-foreground/20"
              }`}
              onClick={() => emblaApi?.scrollTo(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
