import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { TeamManager } from "@/components/admin/crud-managers";
import { SEED_TEAM } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const session = await getSession();
  if (!session || !can(session, "team")) redirect("/admin");

  let items: Awaited<ReturnType<typeof prisma.teamMember.findMany>> = [];
  try {
    if (!(process.env.DATABASE_URL || "").includes("user:password@")) {
      items = await prisma.teamMember.findMany({ orderBy: { sortOrder: "asc" } });
    }
  } catch {
    items = [];
  }

  const rows =
    items.length > 0
      ? items
      : SEED_TEAM.map((m, i) => ({
          id: `seed-team-${i}`,
          name: m.name,
          role: m.role,
          bio: m.bio,
          image: m.image,
          status: "PUBLISHED",
          sortOrder: i,
        }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl">Team</h2>
        <p className="mt-1 text-sm text-muted">People featured on the About page.</p>
      </div>
      <TeamManager items={rows} />
    </div>
  );
}
