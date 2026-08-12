"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteMenuModifiers, upsertMenuModifier } from "@/actions/admin";
import { formatPrice } from "@/lib/utils";

export type ModifierRow = {
  id: string;
  menuItemId: string;
  name: string;
  type: "ADD" | "REMOVE";
  priceDelta: number;
  isDefault: boolean;
  sortOrder: number;
  isActive: boolean;
};

export function ModifierManager({
  menuItemId,
  menuItemName,
  modifiers,
  readOnly = false,
}: {
  menuItemId: string;
  menuItemName: string;
  modifiers: ModifierRow[];
  readOnly?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "ADD" as "ADD" | "REMOVE",
    priceDelta: 0,
    isDefault: false,
  });

  const save = () => {
    if (!form.name.trim()) return;
    startTransition(async () => {
      const res = await upsertMenuModifier({
        menuItemId,
        name: form.name.trim(),
        type: form.type,
        priceDelta: form.type === "REMOVE" ? 0 : form.priceDelta,
        isDefault: form.isDefault,
        sortOrder: modifiers.length,
      });
      if (res.success) {
        toast.success(res.message);
        setAdding(false);
        setForm({ name: "", type: "ADD", priceDelta: 0, isDefault: false });
      } else toast.error(res.message);
    });
  };

  const remove = (id: string) => {
    startTransition(async () => {
      const res = await deleteMenuModifiers([id]);
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
    });
  };

  return (
    <div className="mt-6 rounded-xl border border-border bg-surface/50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="font-medium">Customize options</h4>
          <p className="text-xs text-muted">
            Add/remove ingredients for {menuItemName}
          </p>
        </div>
        {!readOnly && (
          <Button size="sm" variant="secondary" onClick={() => setAdding(true)}>
            Add option
          </Button>
        )}
      </div>

      {adding && !readOnly && (
        <div className="mt-4 grid gap-3 rounded-xl border border-border bg-background p-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Extra cheese, No onion…"
            />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <select
              className="h-12 w-full rounded-xl border border-border px-4"
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value as "ADD" | "REMOVE",
                  priceDelta: e.target.value === "REMOVE" ? 0 : form.priceDelta,
                })
              }
            >
              <option value="ADD">Add extra</option>
              <option value="REMOVE">Remove ingredient</option>
            </select>
          </div>
          {form.type === "ADD" && (
            <div className="space-y-2">
              <Label>Extra price (ETB)</Label>
              <Input
                type="number"
                min={0}
                value={form.priceDelta}
                onChange={(e) =>
                  setForm({ ...form, priceDelta: Number(e.target.value) })
                }
              />
            </div>
          )}
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
            />
            Pre-selected by default
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <Button size="sm" onClick={save} disabled={pending}>
              Save
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <ul className="mt-4 space-y-2">
        {modifiers.length === 0 && (
          <li className="text-sm text-muted">No customization options yet.</li>
        )}
        {modifiers.map((mod) => (
          <li
            key={mod.id}
            className="flex items-center justify-between rounded-lg border border-border/60 bg-background px-3 py-2 text-sm"
          >
            <div>
              <span className="font-medium">
                {mod.type === "ADD" ? "+ " : "− "}
                {mod.name}
              </span>
              {mod.type === "ADD" && mod.priceDelta > 0 && (
                <span className="ml-2 text-primary">+{formatPrice(mod.priceDelta)}</span>
              )}
              {mod.isDefault && (
                <span className="ml-2 text-xs text-muted">(default)</span>
              )}
            </div>
            {!readOnly && (
              <button
                type="button"
                className="text-xs text-red-500"
                disabled={pending}
                onClick={() => remove(mod.id)}
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
