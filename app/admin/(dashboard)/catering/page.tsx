import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { CateringManager } from "@/components/admin/catering-manager";
import { getAllCateringPackagesAdmin } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminCateringPage() {
  const session = await getSession();
  if (!session || !can(session, "catering")) redirect("/admin");

  const packages = await getAllCateringPackagesAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl">Catering Packages</h2>
        <p className="mt-1 text-sm text-muted">
          Manage catering tiers, pricing, guest capacities, and included services shown to customers.
        </p>
      </div>
      <CateringManager packages={packages} />
    </div>
  );
}
