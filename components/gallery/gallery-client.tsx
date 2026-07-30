"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { X } from "lucide-react";

type Item = {
  id: string;
  title: string;
  image: string;
  type: string;
  category: string;
  videoUrl: string | null;
};

const CATS = ["all", "restaurant", "food", "drinks", "events", "ambiance"];

export function GalleryClient({ items }: { items: Item[] }) {
  const [category, setCategory] = useState("all");
  const [type, setType] = useState<"all" | "PHOTO" | "VIDEO">("all");
  const [visible, setVisible] = useState(8);
  const [lightbox, setLightbox] = useState<Item | null>(null);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (category !== "all" && i.category !== category) return false;
      if (type !== "all" && i.type !== type) return false;
      return true;
    });
  }, [items, category, type]);

  const shown = filtered.slice(0, visible);

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {CATS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setCategory(c);
              setVisible(8);
            }}
            className={`rounded-full px-4 py-2 text-sm capitalize ${
              category === c ? "bg-primary text-white" : "bg-foreground/5 text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {(["all", "PHOTO", "VIDEO"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setType(t);
              setVisible(8);
            }}
            className={`rounded-full px-4 py-2 text-xs uppercase tracking-wider ${
              type === t ? "bg-foreground text-background" : "bg-foreground/5 text-foreground"
            }`}
          >
            {t === "all" ? "All Media" : t === "PHOTO" ? "Photos" : "Videos"}
          </button>
        ))}
      </div>

      <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {shown.map((item) => (
          <button
            key={item.id}
            type="button"
            className="mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl"
            onClick={() => setLightbox(item)}
          >
            <div className="relative aspect-[4/5] w-full">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition hover:scale-105"
                sizes="(max-width:768px) 100vw, 33vw"
                loading="lazy"
              />
            </div>
          </button>
        ))}
      </div>

      {visible < filtered.length && (
        <div className="mt-10 text-center">
          <button
            type="button"
            className="rounded-full bg-primary px-8 py-3 text-white"
            onClick={() => setVisible((v) => v + 6)}
          >
            Load More
          </button>
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.title}
          onClick={() => setLightbox(null)}
          onKeyDown={(e) => e.key === "Escape" && setLightbox(null)}
        >
          <button
            type="button"
            className="absolute right-6 top-6 text-white"
            aria-label="Close lightbox"
            onClick={() => setLightbox(null)}
          >
            <X className="h-8 w-8" />
          </button>
          <div
            className="relative h-[80vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            {lightbox.type === "VIDEO" && lightbox.videoUrl ? (
              <iframe
                src={lightbox.videoUrl}
                className="h-full w-full rounded-xl"
                title={lightbox.title}
                allowFullScreen
              />
            ) : (
              <Image
                src={lightbox.image}
                alt={lightbox.title}
                fill
                className="object-contain"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
