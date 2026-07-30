import type { Metadata } from "next";
import { GalleryClient } from "@/components/gallery/gallery-client";
import { getGallery } from "@/lib/data";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photo and video gallery of Gize Bar & Restaurant — ambiance, cuisine, cocktails, and events.",
};

export default async function GalleryPage() {
  const items = await getGallery();

  return (
    <div className="section-padding pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Gallery</p>
          <h1 className="section-title mt-3">Visual stories from Gize</h1>
          <p className="mt-4 text-muted">
            Atmosphere, plates, pours, and celebrations captured through our lens.
          </p>
        </div>
        <div className="mt-12">
          <GalleryClient items={items} />
        </div>
      </div>
    </div>
  );
}
