"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatPrice, cn } from "@/lib/utils";
import type { MenuItemView } from "@/lib/data";

export function MenuCard({
  item,
  className,
  compact = false,
}: {
  item: MenuItemView;
  className?: string;
  /** Tighter layout for mobile 2-column grids */
  compact?: boolean;
}) {
  return (
    <Card
      className={cn(
        "group overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:shadow-foreground/10",
        className
      )}
    >
      <div className={cn("relative overflow-hidden", compact ? "aspect-square sm:aspect-[4/3]" : "aspect-[4/3]")}>
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width:640px) 50vw, (max-width:1024px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-foreground to-primary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
        <div className={cn("absolute flex flex-wrap gap-1", compact ? "left-2 top-2" : "left-3 top-3 gap-1.5")}>
          {item.isFeatured && <Badge compact={compact}>Featured</Badge>}
          {item.isNew && <Badge compact={compact}>New</Badge>}
          {item.isBestSeller && <Badge compact={compact}>Best</Badge>}
          {item.isSignature && !compact && <Badge>Signature</Badge>}
        </div>
      </div>
      <div className={cn("space-y-2", compact ? "p-3 sm:space-y-3 sm:p-5" : "space-y-3 p-5")}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className={cn(
                "uppercase tracking-[0.15em] text-primary",
                compact ? "text-[9px] sm:text-xs sm:tracking-[0.2em]" : "text-xs tracking-[0.2em]"
              )}
            >
              {item.category.name}
            </p>
            <h3
              className={cn(
                "font-heading text-card-fg",
                compact ? "line-clamp-2 text-base sm:text-xl" : "text-xl"
              )}
            >
              {item.name}
            </h3>
          </div>
          <p
            className={cn(
              "shrink-0 font-medium text-primary",
              compact ? "text-xs sm:text-base" : ""
            )}
          >
            {formatPrice(item.price)}
          </p>
        </div>
        <p
          className={cn(
            "text-muted",
            compact ? "line-clamp-2 text-[11px] leading-snug sm:text-sm" : "line-clamp-2 text-sm"
          )}
        >
          {item.description}
        </p>
        <div
          className={cn(
            "flex flex-wrap items-center gap-2 text-muted",
            compact ? "text-[10px] sm:gap-3 sm:text-xs" : "gap-3 text-xs"
          )}
        >
          {item.calories != null && (
            <span className="inline-flex items-center gap-1">
              <Flame className={cn(compact ? "h-3 w-3" : "h-3.5 w-3.5")} /> {item.calories}
              <span className="hidden sm:inline"> cal</span>
            </span>
          )}
          {item.prepTime != null && (
            <span className="inline-flex items-center gap-1">
              <Clock className={cn(compact ? "h-3 w-3" : "h-3.5 w-3.5")} /> {item.prepTime}
              <span className="hidden sm:inline"> min</span>
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

function Badge({
  children,
  compact,
}: {
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "rounded-full bg-primary font-semibold uppercase tracking-wider text-white shadow",
        compact ? "px-1.5 py-0.5 text-[8px] sm:px-2.5 sm:py-1 sm:text-[10px]" : "px-2.5 py-1 text-[10px]"
      )}
    >
      {children}
    </span>
  );
}

export function MenuCardLink({ item }: { item: MenuItemView }) {
  return (
    <Link href={`/menu?highlight=${item.slug}`} className="block">
      <MenuCard item={item} />
    </Link>
  );
}
