import type { Metadata } from "next";
import { MenuBrowser } from "@/components/menu/menu-browser";
import { getCategories, getMenuItems } from "@/lib/data";

export const metadata: Metadata = {
  title: "Drinks",
  description:
    "Signature cocktails, wine, beer, whiskey, vodka, gin, and hot drinks at Gize Bar & Restaurant.",
};

export default async function DrinksPage() {
  const [items, categories] = await Promise.all([
    getMenuItems({ type: "drink" }),
    getCategories("drink"),
  ]);

  return (
    <div className="section-padding pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <MenuBrowser
          items={items}
          categories={categories}
          title="Bar & Drinks"
          subtitle="Craft cocktails, premium spirits, and refined pours for every mood."
        />
      </div>
    </div>
  );
}
