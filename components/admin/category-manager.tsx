"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DataTable, StatusBadge, type DataTableColumn } from "@/components/admin/data-table";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import {
  deleteCategories,
  upsertCategory,
} from "@/actions/admin";

type Cat = {
  id: string;
  name: string;
  slug: string;
  type: string;
  sortOrder: number;
  status: string;
  description?: string | null;
  image?: string | null;
};

export function CategoryManager({ categories }: { categories: Cat[] }) {
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<Cat | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "food",
    image: "",
    sortOrder: 0,
    status: "PUBLISHED",
  });

  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm({ name: "", description: "", type: "food", image: "", sortOrder: 0, status: "PUBLISHED" });
  };

  const openEdit = (c: Cat) => {
    setEditing(c);
    setCreating(false);
    setForm({
      name: c.name,
      description: c.description || "",
      type: c.type,
      image: c.image || "",
      sortOrder: c.sortOrder,
      status: c.status,
    });
  };

  const save = () => {
    start(async () => {
      const res = await upsertCategory({
        id: editing?.id,
        name: form.name,
        description: form.description,
        type: form.type as "food" | "drink",
        image: form.image || null,
        sortOrder: Number(form.sortOrder),
        status: form.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
      });
      if (res.success) {
        toast.success(res.message);
        setCreating(false);
        setEditing(null);
      } else toast.error(res.message);
    });
  };

  const columns: DataTableColumn<Cat>[] = [
    { key: "name", header: "Name", sortable: true },
    { key: "type", header: "Type", sortable: true },
    { key: "sortOrder", header: "Order", sortable: true },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <Button size="sm" variant="outline" onClick={() => openEdit(r)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        rows={categories}
        columns={columns}
        searchKeys={["name", "type", "slug"]}
        onBulkDelete={(ids) =>
          start(async () => {
            const res = await deleteCategories(ids);
            if (res.success) toast.success(res.message);
            else toast.error(res.message);
          })
        }
        toolbar={
          <Button size="sm" onClick={openCreate}>
            Add Category
          </Button>
        }
      />

      {(creating || editing) && (
        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
          <h3 className="font-heading text-xl">{editing ? "Edit Category" : "New Category"}</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="food">Food</option>
                <option value="drink">Drink</option>
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Sort order</Label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <ImageUploadField
              label="Category image"
              value={form.image}
              onChange={(image) => setForm({ ...form, image })}
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={save} disabled={pending}>
              Save
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
