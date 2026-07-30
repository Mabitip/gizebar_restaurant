import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { CategoryManager } from "@/components/admin/category-manager";
import { SEED_CATEGORIES } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const session = await getSession();
  if (!session || !can(session, "categories")) redirect("/admin");

  let categories: {
    id: string;
    name: string;
    slug: string;
    type: string;
    sortOrder: number;
    status: string;
    description: string | null;
  }[] = [];

  try {
    if (!(process.env.DATABASE_URL || "").includes("user:password@")) {
      categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
    }
  } catch {
    categories = [];
  }

  if (!categories.length) {
    categories = SEED_CATEGORIES.map((c, i) => ({
      id: `seed-${c.slug}`,
      name: c.name,
      slug: c.slug,
      type: c.type,
      sortOrder: c.sortOrder ?? i,
      status: "PUBLISHED",
      description: c.description || null,
    }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl">Categories</h2>
        <p className="mt-1 text-sm text-muted">Organize food and drink menu groups.</p>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
