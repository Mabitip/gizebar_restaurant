import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { ContactsManager } from "@/components/admin/crud-managers";

export const dynamic = "force-dynamic";

export default async function AdminContactsPage() {
  const session = await getSession();
  if (!session || !can(session, "contacts")) redirect("/admin");

  let items: Awaited<ReturnType<typeof prisma.contactMessage.findMany>> = [];
  try {
    if (!(process.env.DATABASE_URL || "").includes("user:password@")) {
      items = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
    }
  } catch {
    items = [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl">Contacts</h2>
        <p className="mt-1 text-sm text-muted">Inbound messages from the contact form.</p>
      </div>
      <ContactsManager items={items} />
    </div>
  );
}
