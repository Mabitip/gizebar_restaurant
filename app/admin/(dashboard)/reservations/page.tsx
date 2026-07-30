import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReservationManager } from "@/components/admin/reservation-manager";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function AdminReservationsPage() {
  const session = await getSession();
  if (!session || !can(session, "reservations")) redirect("/admin");

  let reservations: Awaited<ReturnType<typeof prisma.reservation.findMany>> = [];
  try {
    if (!(process.env.DATABASE_URL || "").includes("user:password@")) {
      reservations = await prisma.reservation.findMany({
        orderBy: { createdAt: "desc" },
      });
    }
  } catch {
    reservations = [];
  }

  const readOnly = !can(session, "reservations", "write");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl">Reservations</h2>
        <p className="text-sm text-muted">
          {readOnly
            ? "View-only access for your role."
            : "Incoming table requests appear here instantly."}
        </p>
      </div>
      <ReservationManager reservations={reservations} readOnly={readOnly} />
    </div>
  );
}
