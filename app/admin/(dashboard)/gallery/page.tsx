import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { GalleryManager } from "@/components/admin/crud-managers";
import { SEED_GALLERY } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const session = await getSession();
  if (!session || !can(session, "gallery")) redirect("/admin");

  let items: Awaited<ReturnType<typeof prisma.galleryItem.findMany>> = [];
  try {
    if (!(process.env.DATABASE_URL || "").includes("user:password@")) {
      items = await prisma.galleryItem.findMany({ orderBy: { sortOrder: "asc" } });
    }
  } catch {
    items = [];
  }

  const rows =
    items.length > 0
      ? items
      : SEED_GALLERY.map((g, i) => ({
          id: `seed-gal-${i}`,
          title: g.title,
          image: g.image,
          category: g.category,
          type: g.type,
          status: "PUBLISHED",
          alt: g.title,
          sortOrder: i,
        }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl">Gallery</h2>
        <p className="mt-1 text-sm text-muted">Manage photos and video featured on the site.</p>
      </div>
      <GalleryManager items={rows} />
    </div>
  );
}
