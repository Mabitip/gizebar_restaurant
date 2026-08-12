"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { Minus, Plus, Search, ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";
import { createOrder } from "@/actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CustomizeSheet } from "@/components/order/customize-sheet";
import { CartProvider, useCart, cartLineUnitPrice, lineTotal } from "@/components/order/cart-context";
import type { OrderMenuItemView } from "@/lib/data";
import { formatPrice, cn } from "@/lib/utils";

type Category = { id: string; name: string; slug: string; type: string };

type TableInfo = {
  number: number;
  label?: string | null;
  zone?: string | null;
  qrToken?: string;
};

function OrderExperience({
  items,
  categories,
  tableInfo,
}: {
  items: OrderMenuItemView[];
  categories: Category[];
  tableInfo: TableInfo | null;
}) {
  const { items: cartItems, itemCount, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [customizing, setCustomizing] = useState<OrderMenuItemView | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [confirmed, setConfirmed] = useState<{ orderNumber: number } | null>(null);
  const [pending, startTransition] = useTransition();

  const [tableNumber, setTableNumber] = useState(tableInfo?.number?.toString() || "");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [orderNote, setOrderNote] = useState("");

  const filtered = useMemo(() => {
    let list = [...items];
    if (category !== "all") list = list.filter((i) => i.category.slug === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [items, category, search]);

  const foodCategories = categories.filter((c) => c.type === "food");
  const drinkCategories = categories.filter((c) => c.type === "drink");

  const submitOrder = () => {
    const num = parseInt(tableNumber, 10);
    if (!num || num < 1) {
      toast.error("Please enter a valid table number");
      return;
    }
    if (!cartItems.length) {
      toast.error("Your cart is empty");
      return;
    }

    startTransition(async () => {
      const res = await createOrder({
        tableNumber: num,
        qrToken: tableInfo?.qrToken || null,
        guestName: guestName || null,
        guestPhone: guestPhone || null,
        note: orderNote || null,
        items: cartItems.map((line) => ({
          menuItemId: line.menuItemId,
          quantity: line.quantity,
          note: line.note || null,
          modifiers: line.modifiers.map((m) => ({
            modifierId: m.id,
            name: m.name,
            type: m.type,
            priceDelta: m.priceDelta,
          })),
        })),
      });

      if (res.success && res.orderNumber) {
        clearCart();
        setShowCheckout(false);
        setShowCart(false);
        setConfirmed({ orderNumber: res.orderNumber });
        toast.success(`Order #${res.orderNumber} sent to kitchen`);
      } else {
        toast.error(res.message);
      }
    });
  };

  if (confirmed) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <div className="rounded-full bg-primary/10 p-6">
          <ShoppingBag className="h-12 w-12 text-primary" />
        </div>
        <h1 className="mt-6 font-heading text-3xl">Order placed</h1>
        <p className="mt-2 text-muted">
          Order <span className="font-medium text-foreground">#{confirmed.orderNumber}</span> is on its way to the kitchen.
        </p>
        <p className="mt-1 text-sm text-muted">Pay at your table when ready.</p>
        <Button className="mt-8" onClick={() => setConfirmed(null)}>
          Order more
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="section-padding pt-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="eyebrow">Digital Menu</p>
          <h1 className="section-title mt-2">Order from your table</h1>
          <p className="mt-3 text-muted">
            Browse, customize, and send your order straight to the kitchen.
          </p>
          {tableInfo && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
              Table {tableInfo.number}
              {tableInfo.label ? ` · ${tableInfo.label}` : ""}
              {tableInfo.zone ? ` · ${tableInfo.zone}` : ""}
            </div>
          )}
        </div>

        <div className="mx-auto mt-8 max-w-4xl px-4 sm:px-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              className="pl-11"
              placeholder="Search food & drinks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
              All
            </FilterChip>
            {foodCategories.map((c) => (
              <FilterChip key={c.id} active={category === c.slug} onClick={() => setCategory(c.slug)}>
                {c.name}
              </FilterChip>
            ))}
            {drinkCategories.map((c) => (
              <FilterChip key={c.id} active={category === c.slug} onClick={() => setCategory(c.slug)}>
                {c.name}
              </FilterChip>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-8 grid max-w-4xl gap-4 px-4 sm:grid-cols-2 sm:px-6">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="flex gap-3 rounded-2xl border border-border bg-background p-3 shadow-sm"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/5" />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-primary">{item.category.name}</p>
                    <h3 className="font-heading text-lg leading-tight">{item.name}</h3>
                  </div>
                  <p className="shrink-0 text-sm font-medium text-primary">{formatPrice(item.price)}</p>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted">{item.description}</p>
                <Button
                  size="sm"
                  className="mt-auto w-fit"
                  onClick={() => setCustomizing(item)}
                >
                  Add
                </Button>
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-12 text-center text-muted">No items match your search.</p>
          )}
        </div>
      </div>

      {itemCount > 0 && (
        <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-40 px-4 md:bottom-6 md:left-auto md:right-6 md:max-w-sm md:px-0">
          <button
            type="button"
            onClick={() => setShowCart(true)}
            className="flex w-full items-center justify-between rounded-2xl bg-primary px-5 py-4 text-white shadow-xl shadow-primary/30"
          >
            <span className="flex items-center gap-2 font-medium">
              <ShoppingBag className="h-5 w-5" />
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </span>
            <span className="font-heading text-lg">{formatPrice(subtotal)}</span>
          </button>
        </div>
      )}

      {customizing && (
        <CustomizeSheet item={customizing} onClose={() => setCustomizing(null)} />
      )}

      {showCart && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 md:items-center">
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-3xl bg-background md:rounded-3xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-heading text-xl">Your order</h2>
              <button type="button" onClick={() => setShowCart(false)} aria-label="Close cart">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {cartItems.map((line) => (
                <div key={line.lineId} className="border-b border-border py-4 last:border-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{line.name}</p>
                      {line.modifiers.length > 0 && (
                        <ul className="mt-1 space-y-0.5 text-xs text-muted">
                          {line.modifiers.map((m, i) => (
                            <li key={i}>
                              {m.type === "ADD" ? "+" : "−"} {m.name}
                              {m.priceDelta > 0 ? ` (${formatPrice(m.priceDelta)})` : ""}
                            </li>
                          ))}
                        </ul>
                      )}
                      {line.note && <p className="mt-1 text-xs italic text-muted">Note: {line.note}</p>}
                    </div>
                    <p className="shrink-0 text-sm font-medium">{formatPrice(lineTotal(line))}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded-full border border-border p-1.5"
                        onClick={() => updateQuantity(line.lineId, line.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-6 text-center text-sm">{line.quantity}</span>
                      <button
                        type="button"
                        className="rounded-full border border-border p-1.5"
                        onClick={() => updateQuantity(line.lineId, line.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-muted underline"
                      onClick={() => removeItem(line.lineId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border px-5 py-4">
              <div className="mb-4 flex justify-between font-heading text-lg">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <Button className="w-full" onClick={() => { setShowCart(false); setShowCheckout(true); }}>
                Checkout
              </Button>
            </div>
          </div>
        </div>
      )}

      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 md:items-center">
          <div className="w-full max-w-lg rounded-t-3xl bg-background p-6 md:rounded-3xl">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl">Confirm order</h2>
              <button type="button" onClick={() => setShowCheckout(false)} aria-label="Close checkout">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-sm text-muted">Pay at your table when your order is ready.</p>

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tableNumber">Table number *</Label>
                <Input
                  id="tableNumber"
                  type="number"
                  min={1}
                  max={999}
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="e.g. 12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guestName">Your name (optional)</Label>
                <Input
                  id="guestName"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guestPhone">Phone (optional)</Label>
                <Input
                  id="guestPhone"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderNote">Order note (optional)</Label>
                <Textarea
                  id="orderNote"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Any special requests for the whole order…"
                  rows={2}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between font-heading text-lg">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            <Button className="mt-4 w-full" disabled={pending} onClick={submitOrder}>
              {pending ? "Sending…" : "Send to kitchen"}
            </Button>
          </div>
        </div>
      )}
    </>
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
      className={cn(
        "shrink-0 rounded-full px-4 py-2 text-sm transition",
        active ? "bg-primary text-white" : "bg-surface text-muted hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

export function OrderBrowser(props: {
  items: OrderMenuItemView[];
  categories: Category[];
  tableInfo: TableInfo | null;
}) {
  return (
    <CartProvider>
      <OrderExperience {...props} />
    </CartProvider>
  );
}

export { cartLineUnitPrice };
