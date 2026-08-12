import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrderManager } from "@/components/admin/order-manager";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const session = await getSession();
  if (!session || !can(session, "orders")) redirect("/admin");

  let orders: Awaited<
    ReturnType<
      typeof prisma.order.findMany<{
        include: {
          items: { include: { modifiers: true } };
          diningTable: true;
        };
      }>
    >
  > = [];

  try {
    if (!(process.env.DATABASE_URL || "").includes("user:password@")) {
      orders = await prisma.order.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
        include: {
          items: { include: { modifiers: true } },
          diningTable: true,
        },
      });
    }
  } catch {
    orders = [];
  }

  const readOnly = !can(session, "orders", "write");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl">Kitchen Queue</h2>
        <p className="text-sm text-muted">
          Live orders from table QR and digital menu. Update status as you prepare and serve.
        </p>
      </div>
      <OrderManager initialOrders={orders} readOnly={readOnly} />
    </div>
  );
}
