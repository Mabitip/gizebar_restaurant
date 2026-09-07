"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Play, Video as VideoIcon, X } from "lucide-react";
import { isDirectVideoUrl, sanitizeVideoEmbedUrl } from "@/lib/video-url";

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
  const safeVideoUrl = lightbox?.videoUrl ? sanitizeVideoEmbedUrl(lightbox.videoUrl) : null;
  const isDirect = safeVideoUrl ? isDirectVideoUrl(safeVideoUrl) : false;

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
            className={`rounded-full px-4 py-2 text-sm capitalize transition ${
              category === c ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-foreground/5 text-foreground hover:bg-foreground/10"
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
            className={`rounded-full px-4 py-2 text-xs uppercase tracking-wider transition ${
              type === t ? "bg-foreground text-background" : "bg-foreground/5 text-foreground hover:bg-foreground/10"
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
            className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl bg-surface text-left shadow-sm transition hover:shadow-lg"
            onClick={() => setLightbox(item)}
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition duration-300 group-hover:scale-105"
                sizes="(max-width:768px) 100vw, 33vw"
                loading="lazy"
              />
              {item.type === "VIDEO" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition group-hover:bg-black/40">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 text-white shadow-lg backdrop-blur-sm transition group-hover:scale-110">
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  </div>
                  <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-md">
                    <VideoIcon className="h-3 w-3" />
                    Video
                  </span>
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="font-medium text-sm text-foreground truncate">{item.title}</p>
              <p className="text-xs text-muted capitalize">{item.category}</p>
            </div>
          </button>
        ))}
      </div>

      {visible < filtered.length && (
        <div className="mt-10 text-center">
          <button
            type="button"
            className="rounded-full bg-primary px-8 py-3 text-white font-medium shadow-md shadow-primary/20 hover:bg-primary/90 transition"
            onClick={() => setVisible((v) => v + 6)}
          >
            Load More
          </button>
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.title}
          onClick={() => setLightbox(null)}
          onKeyDown={(e) => e.key === "Escape" && setLightbox(null)}
        >
          <button
            type="button"
            className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition"
            aria-label="Close lightbox"
            onClick={() => setLightbox(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <div
            className="relative h-[80vh] w-full max-w-5xl flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {lightbox.type === "VIDEO" && safeVideoUrl ? (
              isDirect ? (
                <video
                  src={safeVideoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="h-full w-full max-h-[75vh] rounded-2xl object-contain shadow-2xl bg-black"
                />
              ) : (
                <iframe
                  src={safeVideoUrl}
                  className="h-full w-full max-h-[75vh] rounded-2xl shadow-2xl border border-white/10"
                  title={lightbox.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              )
            ) : (
              <div className="relative h-full w-full">
                <Image
                  src={lightbox.image}
                  alt={lightbox.title}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>
            )}
            <p className="mt-3 text-center text-sm font-medium text-white/90">
              {lightbox.title}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
