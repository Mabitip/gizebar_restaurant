"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Plus, Trash2, Pencil, Star, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DataTable, StatusBadge, type DataTableColumn } from "@/components/admin/data-table";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { upsertCateringPackage, deleteCateringPackages } from "@/actions/admin";
import type { CateringPackage } from "@/lib/seed-data";

function FormShell({
  title,
  children,
  onSave,
  onCancel,
  pending,
}: {
  title: string;
  children: React.ReactNode;
  onSave: () => void;
  onCancel: () => void;
  pending: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
      <h3 className="font-heading text-xl">{title}</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
      <div className="mt-6 flex gap-2">
        <Button onClick={onSave} disabled={pending}>
          {pending ? "Saving..." : "Save Package"}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function CateringManager({
  packages,
}: {
  packages: CateringPackage[];
}) {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();
  const [newHighlight, setNewHighlight] = useState("");
  const [form, setForm] = useState<{
    name: string;
    tagline: string;
    price: string;
    guests: string;
    minGuests: string;
    maxGuests: string;
    description: string;
    image: string;
    featured: boolean;
    highlights: string[];
    status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
    sortOrder: number;
  }>({
    name: "",
    tagline: "",
    price: "",
    guests: "",
    minGuests: "",
    maxGuests: "",
    description: "",
    image: "",
    featured: false,
    highlights: [],
    status: "PUBLISHED",
    sortOrder: 0,
  });

  const handleAddHighlight = () => {
    if (!newHighlight.trim()) return;
    setForm((prev) => ({
      ...prev,
      highlights: [...prev.highlights, newHighlight.trim()],
    }));
    setNewHighlight("");
  };

  const handleRemoveHighlight = (index: number) => {
    setForm((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }));
  };

  const columns: DataTableColumn<CateringPackage>[] = [
    {
      key: "image",
      header: "Banner",
      render: (r) => (
        <div className="relative h-12 w-20 overflow-hidden rounded-lg border border-border bg-muted/20">
          {r.image ? (
            <Image src={r.image} alt={r.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-muted">
              No Image
            </div>
          )}
        </div>
      ),
    },
    {
      key: "name",
      header: "Package Name",
      sortable: true,
      render: (r) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{r.name}</span>
            {r.featured && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-500">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Featured
              </span>
            )}
          </div>
          {r.tagline && <p className="text-xs text-muted line-clamp-1">{r.tagline}</p>}
        </div>
      ),
    },
    {
      key: "price",
      header: "Price / Person",
      sortable: true,
      render: (r) => <span className="font-semibold text-primary">{r.price || "Quote on request"}</span>,
    },
    {
      key: "guests",
      header: "Capacity / Guests",
      sortable: true,
      render: (r) => <span className="text-sm">{r.guests || "Flexible"}</span>,
    },
    {
      key: "highlights",
      header: "Included Services",
      render: (r) => (
        <div className="text-xs text-muted">
          {r.highlights?.length > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-surface px-2 py-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              {r.highlights.length} inclusion{r.highlights.length > 1 ? "s" : ""}
            </span>
          ) : (
            "—"
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 px-2.5 text-xs"
            onClick={() => {
              setEditId(r.id);
              setOpen(true);
              setForm({
                name: r.name,
                tagline: r.tagline || "",
                price: r.price || "",
                guests: r.guests || "",
                minGuests: r.minGuests?.toString() || "",
                maxGuests: r.maxGuests?.toString() || "",
                description: r.description || "",
                image: r.image || "",
                featured: r.featured || false,
                highlights: Array.isArray(r.highlights) ? r.highlights : [],
                status: r.status || "PUBLISHED",
                sortOrder: r.sortOrder || 0,
              });
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Edit</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={pending}
            onClick={() => {
              if (confirm(`Are you sure you want to delete catering package "${r.name}"?`)) {
                start(async () => {
                  const res = await deleteCateringPackages([r.id]);
                  if (res.success) toast.success(res.message);
                  else toast.error(res.message);
                });
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        rows={packages}
        columns={columns}
        searchKeys={["name", "tagline", "price", "guests"]}
        onBulkDelete={(ids) =>
          start(async () => {
            const res = await deleteCateringPackages(ids);
            if (res.success) toast.success(res.message);
            else toast.error(res.message);
          })
        }
        toolbar={
          <Button
            size="sm"
            onClick={() => {
              setEditId(undefined);
              setOpen(true);
              setForm({
                name: "",
                tagline: "",
                price: "",
                guests: "",
                minGuests: "",
                maxGuests: "",
                description: "",
                image: "",
                featured: false,
                highlights: [
                  "Curated Ethiopian & International menus",
                  "Professional service staff & setup",
                ],
                status: "PUBLISHED",
                sortOrder: packages.length + 1,
              });
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Catering Package
          </Button>
        }
      />

      {open && (
        <FormShell
          title={editId ? "Edit Catering Package" : "New Catering Package"}
          pending={pending}
          onCancel={() => setOpen(false)}
          onSave={() =>
            start(async () => {
              if (!form.name.trim()) {
                toast.error("Package name is required");
                return;
              }

              const res = await upsertCateringPackage({
                id: editId,
                name: form.name.trim(),
                tagline: form.tagline.trim(),
                price: form.price.trim(),
                guests: form.guests.trim(),
                minGuests: form.minGuests ? parseInt(form.minGuests, 10) : null,
                maxGuests: form.maxGuests ? parseInt(form.maxGuests, 10) : null,
                description: form.description.trim(),
                image: form.image || null,
                featured: form.featured,
                highlights: form.highlights,
                status: form.status,
                sortOrder: form.sortOrder,
              });

              if (res.success) {
                toast.success(res.message);
                setOpen(false);
              } else {
                toast.error(res.message);
              }
            })
          }
        >
          <div className="space-y-2 sm:col-span-2">
            <Label>Package Name *</Label>
            <Input
              placeholder="e.g. Signature Reception Package"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Tagline / Subtitle</Label>
            <Input
              placeholder="e.g. Our most requested spread with live cooking stations"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            />
          </div>

          <div className="sm:col-span-2">
            <ImageUploadField
              label="Package Banner / Cover Image"
              value={form.image}
              onChange={(image) => setForm({ ...form, image })}
            />
          </div>

          <div className="space-y-2">
            <Label>Price / Person</Label>
            <Input
              placeholder="e.g. From 750 ETB / person"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Guest Count Range</Label>
            <Input
              placeholder="e.g. 60 – 150 guests"
              value={form.guests}
              onChange={(e) => setForm({ ...form, guests: e.target.value })}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Package Description</Label>
            <Textarea
              rows={3}
              placeholder="Detailed description of menus, services, setup flow, and presentation..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Highlights / Inclusions Manager */}
          <div className="space-y-3 sm:col-span-2 rounded-xl border border-border bg-surface/50 p-4">
            <Label className="font-medium text-foreground">Package Inclusions & Bullet Highlights</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Custom multi-course buffet with live injera station"
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddHighlight();
                  }
                }}
              />
              <Button type="button" size="sm" onClick={handleAddHighlight}>
                Add Inclusion
              </Button>
            </div>

            <div className="space-y-2 pt-2">
              {form.highlights.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveHighlight(idx)}
                    className="text-muted hover:text-destructive transition p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {form.highlights.length === 0 && (
                <p className="text-xs text-muted">No highlights added yet. Add key inclusions above.</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <select
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as "PUBLISHED" | "DRAFT" | "ARCHIVED",
                })
              }
            >
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="isFeatured"
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
            <Label htmlFor="isFeatured" className="cursor-pointer font-medium">
              Featured Package (Highlighted on Catering page)
            </Label>
          </div>
        </FormShell>
      )}
    </div>
  );
}
