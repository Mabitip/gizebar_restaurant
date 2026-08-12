"use client";

import { useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCart } from "@/components/order/cart-context";
import type { OrderMenuItemView } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

export function CustomizeSheet({
  item,
  onClose,
}: {
  item: OrderMenuItemView;
  onClose: () => void;
}) {
  const { addItem } = useCart();
  const addModifiers = item.modifiers.filter((m) => m.type === "ADD");
  const removeModifiers = item.modifiers.filter((m) => m.type === "REMOVE");

  const [selectedAdds, setSelectedAdds] = useState<string[]>(
    addModifiers.filter((m) => m.isDefault).map((m) => m.id)
  );
  const [selectedRemoves, setSelectedRemoves] = useState<string[]>(
    removeModifiers.filter((m) => m.isDefault).map((m) => m.id)
  );
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  const toggleAdd = (id: string) => {
    setSelectedAdds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleRemove = (id: string) => {
    setSelectedRemoves((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const chosenModifiers = [
    ...addModifiers
      .filter((m) => selectedAdds.includes(m.id))
      .map((m) => ({ id: m.id, name: m.name, type: "ADD" as const, priceDelta: m.priceDelta })),
    ...removeModifiers
      .filter((m) => selectedRemoves.includes(m.id))
      .map((m) => ({ id: m.id, name: m.name, type: "REMOVE" as const, priceDelta: 0 })),
  ];

  const unitPrice =
    item.price + chosenModifiers.reduce((sum, m) => sum + m.priceDelta, 0);

  const handleAdd = () => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      basePrice: item.price,
      quantity,
      note: note.trim() || undefined,
      modifiers: chosenModifiers,
    });
    toast.success(`${item.name} added to cart`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 md:items-center">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-3xl bg-background md:rounded-3xl">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-primary">{item.category.name}</p>
            <h2 className="font-heading text-xl">{item.name}</h2>
            <p className="text-sm text-primary">{formatPrice(item.price)}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {addModifiers.length > 0 && (
            <section className="mb-6">
              <h3 className="text-sm font-medium">Add extras</h3>
              <div className="mt-3 space-y-2">
                {addModifiers.map((m) => (
                  <label
                    key={m.id}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-border px-4 py-3"
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedAdds.includes(m.id)}
                        onChange={() => toggleAdd(m.id)}
                      />
                      <span className="text-sm">{m.name}</span>
                    </span>
                    {m.priceDelta > 0 && (
                      <span className="text-sm text-muted">+{formatPrice(m.priceDelta)}</span>
                    )}
                  </label>
                ))}
              </div>
            </section>
          )}

          {removeModifiers.length > 0 && (
            <section className="mb-6">
              <h3 className="text-sm font-medium">Remove ingredients</h3>
              <div className="mt-3 space-y-2">
                {removeModifiers.map((m) => (
                  <label
                    key={m.id}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-4 py-3"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRemoves.includes(m.id)}
                      onChange={() => toggleRemove(m.id)}
                    />
                    <span className="text-sm">No {m.name.toLowerCase()}</span>
                  </label>
                ))}
              </div>
            </section>
          )}

          <section className="mb-6">
            <Label htmlFor="itemNote">Special instructions</Label>
            <Textarea
              id="itemNote"
              className="mt-2"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. extra spicy, well done…"
              rows={2}
            />
          </section>

          <section>
            <Label>Quantity</Label>
            <div className="mt-2 flex items-center gap-4">
              <button
                type="button"
                className="rounded-full border border-border p-2"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-lg font-medium">{quantity}</span>
              <button
                type="button"
                className="rounded-full border border-border p-2"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </section>
        </div>

        <div className="border-t border-border px-5 py-4">
          <div className="mb-4 flex justify-between font-heading text-lg">
            <span>Item total</span>
            <span>{formatPrice(unitPrice * quantity)}</span>
          </div>
          <Button className="w-full" onClick={handleAdd}>
            Add to order · {formatPrice(unitPrice * quantity)}
          </Button>
        </div>
      </div>
    </div>
  );
}
