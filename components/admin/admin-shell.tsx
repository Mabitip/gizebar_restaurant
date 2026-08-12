"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  CalendarDays,
  FolderTree,
  GalleryHorizontalEnd,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  PartyPopper,
  QrCode,
  Settings,
  Star,
  Ticket,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { navFor, roleLabel, type NavItem } from "@/lib/permissions";
import type { Role } from "@prisma/client";
import { cn } from "@/lib/utils";

const ICONS: Record<NavItem["icon"], React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  menu: UtensilsCrossed,
  categories: FolderTree,
  reservations: CalendarDays,
  events: PartyPopper,
  bookings: Ticket,
  gallery: GalleryHorizontalEnd,
  testimonials: Star,
  team: Users,
  newsletter: Mail,
  contacts: MessageSquare,
  media: ImageIcon,
  analytics: BarChart3,
  users: Users,
  settings: Settings,
  orders: Ticket,
  tables: QrCode,
};

function NavLinks({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1 p-3" aria-label="Admin">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
              active
                ? "bg-primary text-white"
                : "text-white/75 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: { name: string; email: string; role: Role };
}) {
  const [open, setOpen] = useState(false);
  const items = navFor(session.role);

  const aside = (
    <>
      <div className="border-b border-white/10 px-6 py-6">
        <p className="font-heading text-2xl text-white">Gize Admin</p>
        <p className="mt-1 truncate text-xs text-white/50">{session.email}</p>
        <span className="mt-3 inline-flex rounded-full bg-primary/20 px-2.5 py-1 text-[10px] uppercase tracking-wider text-primary">
          {roleLabel(session.role)}
        </span>
      </div>
      <div className="admin-scroll flex-1 overflow-y-auto">
        <NavLinks items={items} onNavigate={() => setOpen(false)} />
      </div>
      <form action={logoutAction} className="border-t border-white/10 p-3">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/75 hover:bg-primary hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </form>
    </>
  );

  return (
    <div className="flex min-h-screen bg-surface text-foreground">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-hidden bg-black lg:flex">
        {aside}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-black shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <p className="font-heading text-xl text-white">Menu</p>
              <button
                type="button"
                className="rounded-lg p-2 text-white/70 hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {aside}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-background px-4 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-border p-2 lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary">Dashboard</p>
              <h1 className="font-heading text-xl">Hello, {session.name.split(" ")[0]}</h1>
            </div>
          </div>
          <Link
            href="/"
            className="rounded-full border border-border px-4 py-2 text-sm transition hover:bg-black hover:text-white"
          >
            View Site
          </Link>
        </header>
        <div className="flex-1 p-4 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
