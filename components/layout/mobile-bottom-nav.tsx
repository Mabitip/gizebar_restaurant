"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Home,
  LayoutGrid,
  UtensilsCrossed,
  Wine,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { NAV_LINKS, SITE, cn } from "@/lib/utils";

const PRIMARY_HREFS = new Set(["/", "/menu", "/reservations", "/drinks"]);

const MORE_LINKS = NAV_LINKS.filter((l) => !PRIMARY_HREFS.has(l.href));

type Props = {
  authHref?: string;
  authLabel?: string;
};

export function MobileBottomNav({
  authHref = "/login",
  authLabel = "Login",
}: Props) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  const moreActive = MORE_LINKS.some((l) => isActive(l.href)) || moreOpen;

  return (
    <>
      <nav
        className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-background/90 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="Mobile app navigation"
      >
        <div className="relative mx-auto grid h-[4.25rem] max-w-lg grid-cols-5 items-end px-1">
          <TabLink
            href="/"
            label="Home"
            active={isActive("/")}
            icon={Home}
          />
          <TabLink
            href="/menu"
            label="Menu"
            active={isActive("/menu")}
            icon={UtensilsCrossed}
          />

          <div className="relative flex flex-col items-center justify-end pb-1">
            <Link
              href="/reservations"
              className={cn(
                "mobile-tab-press absolute -top-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/40 ring-4 ring-background transition",
                isActive("/reservations") && "scale-105 ring-primary/20"
              )}
              aria-label="Book a table"
              aria-current={isActive("/reservations") ? "page" : undefined}
            >
              <CalendarDays className="h-6 w-6" />
            </Link>
            <span
              className={cn(
                "mt-8 text-[10px] font-medium",
                isActive("/reservations") ? "text-primary" : "text-muted"
              )}
            >
              Book
            </span>
          </div>

          <TabLink
            href="/drinks"
            label="Drinks"
            active={isActive("/drinks")}
            icon={Wine}
          />

          <button
            type="button"
            className={cn(
              "mobile-tab-press relative flex flex-col items-center justify-center gap-0.5 pb-2 pt-2 text-[10px] font-medium",
              moreActive ? "text-primary" : "text-muted"
            )}
            aria-expanded={moreOpen}
            aria-controls="mobile-more-sheet"
            onClick={() => setMoreOpen(true)}
          >
            <LayoutGrid className={cn("h-5 w-5", moreActive && "stroke-[2.5]")} />
            More
            {moreActive && (
              <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
            )}
          </button>
        </div>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-[70] md:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            aria-label="Close menu"
            onClick={() => setMoreOpen(false)}
          />
          <div
            id="mobile-more-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="More pages"
            className="absolute inset-x-0 bottom-0 mobile-sheet-enter rounded-t-3xl border border-border bg-background shadow-2xl"
            style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-primary">Explore</p>
                <p className="font-heading text-xl text-foreground">{SITE.shortName}</p>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  type="button"
                  className="rounded-full border border-border p-2 text-foreground"
                  onClick={() => setMoreOpen(false)}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 p-4">
              {MORE_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-2xl border border-border px-4 py-3.5 text-sm font-medium transition",
                    isActive(link.href)
                      ? "border-primary bg-primary text-white"
                      : "bg-surface text-foreground active:scale-[0.98]"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={authHref}
                className="rounded-2xl border border-border bg-surface px-4 py-3.5 text-sm font-medium text-foreground"
              >
                {authLabel === "Dashboard" ? "Dashboard" : "Staff Login"}
              </Link>
            </div>

            <div className="flex flex-col gap-2 px-4 pb-2">
              <Button asChild className="w-full">
                <Link href="/reservations">Book a Table</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/order">Order Now</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function TabLink({
  href,
  label,
  active,
  icon: Icon,
}: {
  href: string;
  label: string;
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "mobile-tab-press relative flex flex-col items-center justify-center gap-0.5 pb-2 pt-2 text-[10px] font-medium",
        active ? "text-primary" : "text-muted"
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
      {label}
      {active && (
        <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
      )}
    </Link>
  );
}
