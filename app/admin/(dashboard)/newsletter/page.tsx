import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { NewsletterManager } from "@/components/admin/crud-managers";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const session = await getSession();
  if (!session || !can(session, "newsletter")) redirect("/admin");

  let items: Awaited<ReturnType<typeof prisma.newsletter.findMany>> = [];
  try {
    if (!(process.env.DATABASE_URL || "").includes("user:password@")) {
      items = await prisma.newsletter.findMany({ orderBy: { createdAt: "desc" } });
    }
  } catch {
    items = [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl">Newsletter</h2>
        <p className="mt-1 text-sm text-muted">Subscriber list management.</p>
      </div>
      <NewsletterManager items={items} />
    </div>
  );
}
