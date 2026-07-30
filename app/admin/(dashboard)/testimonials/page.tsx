import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { TestimonialsManager } from "@/components/admin/crud-managers";
import { SEED_TESTIMONIALS } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const session = await getSession();
  if (!session || !can(session, "testimonials")) redirect("/admin");

  let items: Awaited<ReturnType<typeof prisma.testimonial.findMany>> = [];
  try {
    if (!(process.env.DATABASE_URL || "").includes("user:password@")) {
      items = await prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } });
    }
  } catch {
    items = [];
  }

  const rows =
    items.length > 0
      ? items
      : SEED_TESTIMONIALS.map((t, i) => ({
          id: `seed-t-${i}`,
          name: t.name,
          role: t.role,
          content: t.content,
          rating: t.rating,
          isFeatured: t.isFeatured,
          status: "PUBLISHED",
        }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl">Testimonials</h2>
        <p className="mt-1 text-sm text-muted">Guest reviews shown on the public site.</p>
      </div>
      <TestimonialsManager items={rows} />
    </div>
  );
}
