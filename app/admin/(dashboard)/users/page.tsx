import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { UsersManager } from "@/components/admin/crud-managers";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session || !can(session, "users")) redirect("/admin");

  let users: Awaited<ReturnType<typeof prisma.user.findMany>> = [];
  try {
    if (!(process.env.DATABASE_URL || "").includes("user:password@")) {
      users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    }
  } catch {
    users = [];
  }

  if (!users.length) {
    users = [
      {
        id: "demo-super",
        email: process.env.ADMIN_EMAIL || "admin@gizebarandrestaurant.com",
        name: "Gize Super Admin",
        role: "SUPER_ADMIN",
        isActive: true,
        lastLoginAt: null,
        passwordHash: "",
        avatar: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
        passwordChangedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl">Users</h2>
        <p className="mt-1 text-sm text-muted">
          Manage staff accounts and RBAC roles (Super Admin only).
        </p>
      </div>
      <UsersManager users={users} />
    </div>
  );
}
