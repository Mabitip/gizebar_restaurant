"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { MenuCard } from "@/components/menu/menu-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { MenuItemView } from "@/lib/data";

type Category = { id: string; name: string; slug: string };

export function MenuBrowser({
  items,
  categories,
  title = "Our Menu",
  subtitle = "Explore dishes crafted with passion and precision",
}: {
  items: MenuItemView[];
  categories: Category[];
  title?: string;
  subtitle?: string;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"name" | "price-asc" | "price-desc">("name");
  const [page, setPage] = useState(1);
  const perPage = 9;

  const filtered = useMemo(() => {
    let list = [...items];
    if (category !== "all") {
      list = list.filter((i) => i.category.slug === category);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [items, category, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <div className="mx-auto max-w-3xl text-center">
        <p className="eyebrow">Dining</p>
        <h1 className="section-title mt-3">{title}</h1>
        <p className="mt-4 text-muted">{subtitle}</p>
      </div>

      <div className="mx-auto mt-10 flex max-w-4xl flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            className="pl-11"
            placeholder="Search dishes…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            aria-label="Search menu"
          />
        </div>
        <select
          className="h-12 rounded-xl border border-border bg-input-bg px-4 text-sm text-foreground"
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          aria-label="Sort menu"
        >
          <option value="name">Sort by Name</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <FilterChip
          active={category === "all"}
          onClick={() => {
            setCategory("all");
            setPage(1);
          }}
        >
          All
        </FilterChip>
        {categories.map((c) => (
          <FilterChip
            key={c.id}
            active={category === c.slug}
            onClick={() => {
              setCategory(c.slug);
              setPage(1);
            }}
          >
            {c.name}
          </FilterChip>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-6 lg:grid-cols-3">
        {pageItems.map((item) => (
          <MenuCard key={item.id} item={item} compact />
        ))}
      </div>

      {!pageItems.length && (
        <p className="mt-12 text-center text-muted">No items match your filters.</p>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm transition ${
        active
          ? "bg-primary text-white shadow"
          : "bg-foreground/5 text-foreground hover:bg-foreground/10"
      }`}
    >
      {children}
    </button>
  );
}
