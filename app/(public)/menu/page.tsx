import type { Metadata } from "next";
import { MenuBrowser } from "@/components/menu/menu-browser";
import { getCategories, getMenuItems } from "@/lib/data";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Explore breakfast, lunch, dinner, traditional Ethiopian cuisine, international dishes, and desserts at Gize Bar & Restaurant.",
};

export default async function MenuPage() {
  const [items, categories] = await Promise.all([
    getMenuItems({ type: "food" }),
    getCategories("food"),
  ]);

  return (
    <div className="section-padding pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <MenuBrowser
          items={items}
          categories={categories}
          title="Our Menu"
          subtitle="From Ethiopian classics to international favorites — every plate tells a story."
        />
      </div>
    </div>
  );
}
