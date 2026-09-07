import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { MediaLibraryClient, type MediaItem } from "@/components/admin/media-library-client";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const session = await getSession();
  if (!session || !can(session, "media")) redirect("/admin");

  let media: MediaItem[] = [];
  try {
    if (!(process.env.DATABASE_URL || "").includes("user:password@")) {
      const rows = await prisma.media.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      media = rows.map((r) => ({
        id: r.id,
        url: r.url,
        publicId: r.publicId,
        filename: r.filename,
        mimeType: r.mimeType,
        size: r.size,
        width: r.width,
        height: r.height,
        alt: r.alt,
        folder: r.folder,
        createdAt: r.createdAt.toISOString(),
      }));
    }
  } catch (error) {
    console.error("Could not fetch media list:", error);
    media = [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl">Cloudinary Media Library</h2>
        <p className="text-sm text-muted">
          Manage, upload, preview, and delete your high-performance Cloudinary images and videos.
        </p>
      </div>

      <MediaLibraryClient initialMedia={media} />
    </div>
  );
}
