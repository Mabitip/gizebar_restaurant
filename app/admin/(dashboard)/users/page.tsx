import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { UsersManager } from "@/components/admin/crud-managers";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session || !can(session, "users")) redirect("/admin");

  type SafeUser = {
    id: string;
    email: string;
    name: string;
    role: "SUPER_ADMIN" | "RESERVATION_MANAGER" | "CONTENT_EDITOR";
    isActive: boolean;
    lastLoginAt: Date | null;
    avatar: string | null;
    createdAt: Date;
    updatedAt: Date;
  };

  let users: SafeUser[] = [];
  try {
    if (!(process.env.DATABASE_URL || "").includes("user:password@")) {
      users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      });
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
        avatar: null,
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
