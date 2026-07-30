import { MenuCard } from "@/components/menu/menu-card";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/motion";
import type { MenuItemView } from "@/lib/data";

export function DishGrid({
  title,
  eyebrow,
  description,
  items,
  dark = false,
}: {
  title: string;
  eyebrow: string;
  description: string;
  items: MenuItemView[];
  dark?: boolean;
}) {
  if (!items.length) return null;
  return (
    <section
      className={`section-padding text-foreground ${
        dark ? "bg-surface" : "bg-background"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="section-title mt-3 text-foreground">{title}</h2>
          <p className="mt-4 text-muted">{description}</p>
        </FadeIn>
        <Stagger className="mt-12 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
          {items.map((item) => (
            <StaggerItem key={item.id}>
              <MenuCard item={item} compact />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
