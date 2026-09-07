"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { MEDIA } from "@/lib/media";
import { NAV_LINKS, SITE, cn, type NavLink } from "@/lib/utils";

function linkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavItem({ link, pathname }: { link: NavLink; pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasChildren = !!link.children?.length;
  const active =
    linkActive(pathname, link.href) ||
    !!link.children?.some((child) => linkActive(pathname, child.href));

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!hasChildren) {
    return (
      <Link
        href={link.href}
        className={cn(
          "rounded-full px-3 py-2 text-sm transition-colors",
          active
            ? "bg-white/15 text-white underline decoration-white decoration-2 underline-offset-8"
            : "text-white/85 hover:text-white"
        )}
      >
        {link.label}
      </Link>
    );
  }

  const dropdownItems = [
    { href: link.href, label: `${link.label} Overview` },
    ...link.children!,
  ];

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm transition-colors cursor-pointer",
          active
            ? "bg-white/15 text-white underline decoration-white decoration-2 underline-offset-8"
            : "text-white/85 hover:text-white"
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setOpen((v) => !v);
        }}
      >
        {link.label}
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      <div
        className={cn(
          "absolute left-1/2 top-full z-50 pt-2 -translate-x-1/2 transition-all duration-200",
          open
            ? "visible opacity-100 translate-y-0 pointer-events-auto"
            : "invisible opacity-0 translate-y-1 pointer-events-none"
        )}
      >
        <div
          role="menu"
          className="min-w-[210px] rounded-2xl border border-white/15 bg-primary/95 p-2 shadow-xl backdrop-blur-xl"
        >
          {dropdownItems.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              role="menuitem"
              className={cn(
                "block rounded-xl px-4 py-2.5 text-sm transition",
                linkActive(pathname, child.href)
                  ? "bg-white text-primary font-medium"
                  : "text-white/90 hover:bg-white/15"
              )}
              onClick={() => setOpen(false)}
            >
              {child.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

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
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setExpanded(null);
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
            <NavItem key={link.href} link={link} pathname={pathname} />
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
            <Link href="/order">Order Now</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-white text-primary hover:bg-black hover:text-white"
          >
            <Link href="/reservations">Book Table</Link>
          </Button>
        </div>

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
            {NAV_LINKS.map((link) => {
              const active =
                linkActive(pathname, link.href) ||
                !!link.children?.some((child) => linkActive(pathname, child.href));

              if (!link.children?.length) {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "rounded-xl px-4 py-3 text-base",
                      active ? "bg-white text-primary" : "text-white/90 hover:bg-white/10"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              }

              const isExpanded = expanded === link.href;
              return (
                <div key={link.href} className="rounded-xl">
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-base",
                      active ? "bg-white/15 text-white" : "text-white/90 hover:bg-white/10"
                    )}
                    aria-expanded={isExpanded}
                    onClick={() =>
                      setExpanded((prev) => (prev === link.href ? null : link.href))
                    }
                  >
                    {link.label}
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </button>
                  {isExpanded && (
                    <div className="mt-1 space-y-1 border-l border-white/20 pl-3">
                      <Link
                        href={link.href}
                        className={cn(
                          "block rounded-xl px-4 py-2.5 text-sm",
                          linkActive(pathname, link.href)
                            ? "bg-white text-primary font-medium"
                            : "text-white/85 hover:bg-white/10"
                        )}
                      >
                        {link.label} Overview
                      </Link>
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "block rounded-xl px-4 py-2.5 text-sm",
                            linkActive(pathname, child.href)
                              ? "bg-white text-primary font-medium"
                              : "text-white/85 hover:bg-white/10"
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
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
                <Link href="/order">Order Now</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
