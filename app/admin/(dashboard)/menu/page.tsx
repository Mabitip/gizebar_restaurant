import { redirect } from "next/navigation";
import { getMenuItems, getCategories } from "@/lib/data";
import { AdminMenuManager } from "@/components/admin/menu-manager";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/permissions";

export default async function AdminMenuPage() {
  const session = await getSession();
  if (!session || !can(session, "menu")) redirect("/admin");

  const [items, categories] = await Promise.all([getMenuItems(), getCategories()]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl">Manage Menu</h2>
        <p className="text-sm text-muted">Create, edit, feature, and publish menu items.</p>
      </div>
      <AdminMenuManager items={items} categories={categories} />
    </div>
  );
}
