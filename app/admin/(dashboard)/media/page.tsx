import { redirect } from "next/navigation";
import { MediaUploader } from "@/components/admin/media-uploader";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/permissions";

export default async function AdminMediaPage() {
  const session = await getSession();
  if (!session || !can(session, "media")) redirect("/admin");

  let media: { id: string; url: string; filename: string | null; alt: string | null }[] = [];
  try {
    if (!(process.env.DATABASE_URL || "").includes("user:password@")) {
      media = await prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 48 });
    }
  } catch {
    media = [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl">Media Library</h2>
        <p className="text-sm text-muted">
          Upload images to Cloudinary or paste URLs for local/demo use.
        </p>
      </div>
      <MediaUploader />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {media.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-xl border border-border bg-background">
            <div className="relative aspect-square">
              <Image src={item.url} alt={item.alt || ""} fill className="object-cover" />
            </div>
            <p className="truncate p-2 text-xs text-muted">{item.filename || item.url}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
