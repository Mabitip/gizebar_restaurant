"use client";

import Image from "next/image";
import Link from "next/link";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";

export function GalleryPreview({
  items,
}: {
  items: { id: string; title: string; image: string }[];
}) {
  return (
    <section className="section-padding bg-surface text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Gallery</p>
            <h2 className="section-title mt-3 text-foreground">Moments at Gize</h2>
          </div>
          <Button asChild variant="secondary">
            <Link href="/gallery">View Gallery</Link>
          </Button>
        </FadeIn>
        <Stagger className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {items.slice(0, 8).map((item, i) => (
            <StaggerItem
              key={item.id}
              className={i === 0 || i === 5 ? "md:col-span-2 md:row-span-2" : ""}
            >
              <div className="group relative aspect-square overflow-hidden rounded-2xl">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-110"
                  sizes="(max-width:768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 transition group-hover:opacity-100" />
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
