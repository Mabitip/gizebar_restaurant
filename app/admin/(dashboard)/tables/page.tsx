import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TableManager } from "@/components/admin/table-manager";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function AdminTablesPage() {
  const session = await getSession();
  if (!session || !can(session, "tables")) redirect("/admin");

  let tables: Awaited<ReturnType<typeof prisma.diningTable.findMany>> = [];
  try {
    if (!(process.env.DATABASE_URL || "").includes("user:password@")) {
      tables = await prisma.diningTable.findMany({
        orderBy: { number: "asc" },
      });
    }
  } catch {
    tables = [];
  }

  const readOnly = !can(session, "tables", "write");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl">Universal Tables & QR</h2>
        <p className="text-sm text-muted">
          One Master QR code for all tables across your venue with high-res printable table stands and streamlined table management.
        </p>
      </div>
      <TableManager tables={tables} readOnly={readOnly} />
    </div>
  );
}
