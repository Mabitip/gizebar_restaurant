import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MenuCard } from "@/components/menu/menu-card";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/motion";
import type { MenuItemView } from "@/lib/data";

export function FeaturedMenu({ items }: { items: MenuItemView[] }) {
  return (
    <section className="section-padding bg-surface text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Featured Menu</p>
          <h2 className="section-title mt-3 text-foreground">Plates that define Gize</h2>
          <p className="mt-4 text-muted">
            A curated selection of our most celebrated dishes and drinks.
          </p>
        </FadeIn>
        <Stagger className="mt-12 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
          {items.slice(0, 6).map((item) => (
            <StaggerItem key={item.id}>
              <MenuCard item={item} compact />
            </StaggerItem>
          ))}
        </Stagger>
        <div className="mt-10 text-center">
          <Button asChild variant="secondary">
            <Link href="/menu">View Full Menu</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
