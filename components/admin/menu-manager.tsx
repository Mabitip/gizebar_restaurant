"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MultiImageUploadField } from "@/components/admin/multi-image-upload-field";
import {
  bulkPublishMenu,
  deleteMenuItems,
  upsertMenuItem,
} from "@/actions/admin";
import type { MenuItemView } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

export function AdminMenuManager({
  items,
  categories,
}: {
  items: MenuItemView[];
  categories: { id: string; name: string; slug: string }[];
  }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<MenuItemView | null>(null);
  const [creating, setCreating] = useState(false);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter(
      (i) =>
        !q ||
        i.name.toLowerCase().includes(q) ||
        i.category.name.toLowerCase().includes(q)
    );
  }, [items, search]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const runBulk = (action: "delete" | "publish" | "draft") => {
    if (!selected.length) return;
    startTransition(async () => {
      const res =
        action === "delete"
          ? await deleteMenuItems(selected)
          : await bulkPublishMenu(
              selected,
              action === "publish" ? "PUBLISHED" : "DRAFT"
            );
      if (res.success) {
        toast.success(res.message);
        setSelected([]);
      } else toast.error(res.message);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search menu…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => runBulk("publish")} disabled={pending}>
            Bulk Publish
          </Button>
          <Button size="sm" variant="secondary" onClick={() => runBulk("draft")} disabled={pending}>
            Bulk Draft
          </Button>
          <Button size="sm" variant="secondary" onClick={() => runBulk("delete")} disabled={pending}>
            Bulk Delete
          </Button>
          <Button size="sm" onClick={() => { setCreating(true); setEditing(null); }}>
            Add Item
          </Button>
        </div>
      </div>

      {(creating || editing) && (
        <MenuItemForm
          categories={categories}
          initial={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}

      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/[0.02] text-black/50">
            <tr>
              <th className="p-3">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={selected.length === filtered.length && filtered.length > 0}
                  onChange={(e) =>
                    setSelected(e.target.checked ? filtered.map((i) => i.id) : [])
                  }
                />
              </th>
              <th className="p-3">Item</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Badges</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-t border-black/5">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(item.id)}
                    onChange={() => toggle(item.id)}
                    aria-label={`Select ${item.name}`}
                  />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                        <Image src={item.image} alt="" fill className="object-cover" />
                      </div>
                    )}
                    <span className="font-medium">{item.name}</span>
                  </div>
                </td>
                <td className="p-3">{item.category.name}</td>
                <td className="p-3">{formatPrice(item.price)}</td>
                <td className="p-3 text-xs text-black/50">
                  {[
                    item.isFeatured && "Featured",
                    item.isNew && "New",
                    item.isBestSeller && "Best",
                    item.isSignature && "Signature",
                  ]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </td>
                <td className="p-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditing(item);
                      setCreating(false);
                    }}
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MenuItemForm({
  categories,
  initial,
  onClose,
}: {
  categories: { id: string; name: string; slug: string }[];
  initial: MenuItemView | null;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: initial?.name || "",
    description: initial?.description || "",
    price: initial?.price || 0,
    categoryId: initial?.category.id || categories[0]?.id || "",
    images:
      initial?.images?.length
        ? initial.images
        : initial?.image
          ? [initial.image]
          : ([] as string[]),
    calories: initial?.calories || 0,
    prepTime: initial?.prepTime || 0,
    isFeatured: initial?.isFeatured || false,
    isNew: initial?.isNew || false,
    isBestSeller: initial?.isBestSeller || false,
    isSignature: initial?.isSignature || false,
    isChefPick: initial?.isChefPick || false,
    isTodaysSpecial: initial?.isTodaysSpecial || false,
    isAvailable: initial?.isAvailable ?? true,
  });

  const save = () => {
    startTransition(async () => {
      const res = await upsertMenuItem({
        id: initial?.id,
        name: form.name,
        description: form.description,
        price: form.price,
        categoryId: form.categoryId,
        images: form.images,
        image: form.images[0] || null,
        calories: form.calories,
        prepTime: form.prepTime,
        isFeatured: form.isFeatured,
        isNew: form.isNew,
        isBestSeller: form.isBestSeller,
        isSignature: form.isSignature,
        isChefPick: form.isChefPick,
        isTodaysSpecial: form.isTodaysSpecial,
        isAvailable: form.isAvailable,
        tags: [],
        status: "PUBLISHED",
      });
      if (res.success) {
        toast.success(res.message);
        onClose();
      } else toast.error(res.message);
    });
  };

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
      <h3 className="font-heading text-xl">{initial ? "Edit Item" : "New Item"}</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Price (ETB)</Label>
          <Input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Description</Label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <select
            className="h-12 w-full rounded-xl border border-black/10 px-4"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <MultiImageUploadField
            label="Images"
            values={form.images}
            onChange={(images) => setForm({ ...form, images })}
            max={8}
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        {(
          [
            ["isFeatured", "Featured"],
            ["isNew", "New"],
            ["isBestSeller", "Best Seller"],
            ["isSignature", "Signature"],
            ["isChefPick", "Chef Pick"],
            ["isTodaysSpecial", "Today's Special"],
            ["isAvailable", "Available"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
            />
            {label}
          </label>
        ))}
      </div>
      <div className="mt-6 flex gap-3">
        <Button onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
