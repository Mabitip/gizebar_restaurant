import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { SettingsForm } from "@/components/admin/settings-form";
import { SITE } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session || !can(session, "settings")) redirect("/admin");

  let initial = {
    name: SITE.name,
    phone: SITE.phone,
    email: SITE.email,
    address: SITE.address,
    description: SITE.description,
    seoTitle: `${SITE.name} | Luxury Dining in Bole, Addis Ababa`,
    seoDescription: SITE.description,
  };

  try {
    if (!(process.env.DATABASE_URL || "").includes("user:password@")) {
      const [siteRow, seoRow] = await Promise.all([
        prisma.setting.findUnique({ where: { key: "site" } }),
        prisma.setting.findUnique({ where: { key: "seo" } }),
      ]);
      if (siteRow?.value && typeof siteRow.value === "object") {
        initial = { ...initial, ...(siteRow.value as object) };
      }
      if (seoRow?.value && typeof seoRow.value === "object") {
        initial = { ...initial, ...(seoRow.value as object) };
      }
    }
  } catch {
    // keep defaults
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-3xl">Site & SEO Settings</h2>
        <p className="text-sm text-muted">Super Admin only — identity, contact, and search metadata.</p>
      </div>
      <SettingsForm initial={initial} />
    </div>
  );
}
