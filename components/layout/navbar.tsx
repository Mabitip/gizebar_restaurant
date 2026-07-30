"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { MEDIA } from "@/lib/media";
import { NAV_LINKS, SITE, whatsappUrl, cn } from "@/lib/utils";

export function Navbar({
  authHref = "/login",
  authLabel = "Login",
}: {
  authHref?: string;
  authLabel?: string;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 bg-header text-header-fg transition-all duration-500",
        scrolled || open
          ? "bg-primary/95 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-white/10"
          : "bg-header"
      )}
    >
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-20 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="group flex items-center gap-2.5 md:gap-3"
          aria-label={`${SITE.name} home`}
        >
          <span className="relative h-10 w-10 shrink-0 md:h-14 md:w-14">
            <Image
              src={MEDIA.brand.logoWhite}
              alt=""
              fill
              priority
              className="object-contain"
              sizes="56px"
            />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-heading text-lg font-semibold tracking-wide text-white md:text-2xl">
              {SITE.shortName}
            </span>
            <span className="hidden text-[10px] uppercase tracking-[0.3em] text-white/80 sm:block">
              Bar & Restaurant
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 xl:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3 py-2 text-sm transition-colors",
                pathname === link.href
                  ? "bg-white/15 text-white underline decoration-white decoration-2 underline-offset-8"
                  : "text-white/85 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href={authHref}
            className="rounded-full px-3 py-2 text-sm text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            {authLabel}
          </Link>
          <ThemeToggle />
          <Button asChild size="sm" variant="outline" className="border-white/40">
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
              Order Now
            </a>
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-white text-primary hover:bg-black hover:text-white"
          >
            <Link href="/reservations">Book Table</Link>
          </Button>
        </div>

        {/* Tablet: overflow menu. Phones use bottom nav More sheet. */}
        <div className="hidden items-center gap-2 md:flex xl:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="rounded-full p-2 text-white"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
        </div>
      </nav>

      {open && (
        <div className="hidden border-t border-white/15 bg-primary px-4 py-6 md:block xl:hidden">
          <div className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-xl px-4 py-3 text-base",
                  pathname === link.href
                    ? "bg-white text-primary"
                    : "text-white/90 hover:bg-white/10"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={authHref}
              className="rounded-xl px-4 py-3 text-base text-white/90 hover:bg-white/10"
            >
              {authLabel === "Dashboard" ? "Dashboard" : "Staff Login"}
            </Link>
            <div className="mt-4 flex flex-col gap-3">
              <Button
                asChild
                className="bg-white text-primary hover:bg-black hover:text-white"
              >
                <Link href="/reservations">Book Table</Link>
              </Button>
              <Button asChild variant="outline">
                <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
                  Order Now
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
