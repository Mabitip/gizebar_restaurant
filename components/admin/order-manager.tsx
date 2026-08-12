"use client";

import { useEffect, useState, useTransition } from "react";
import type { OrderStatus } from "@prisma/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "@/actions/orders";
import { formatPrice } from "@/lib/utils";

type OrderModifier = {
  id: string;
  name: string;
  type: "ADD" | "REMOVE";
  priceDelta: number;
};

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  note: string | null;
  modifiers: OrderModifier[];
};

type Order = {
  id: string;
  orderNumber: number;
  tableNumber: number;
  guestName: string | null;
  guestPhone: string | null;
  note: string | null;
  status: string;
  subtotal: number;
  total: number;
  createdAt: Date | string;
  items: OrderItem[];
  diningTable: { label: string | null; zone: string | null } | null;
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  ACCEPTED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-orange-100 text-orange-800",
  READY: "bg-green-100 text-green-800",
  SERVED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-700",
};

const NEXT_STATUS: Partial<Record<string, string>> = {
  PENDING: "ACCEPTED",
  ACCEPTED: "PREPARING",
  PREPARING: "READY",
  READY: "SERVED",
};

export function OrderManager({
  initialOrders,
  readOnly = false,
}: {
  initialOrders: Order[];
  readOnly?: boolean;
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const activeOrders = orders.filter((o) => !["SERVED", "CANCELLED"].includes(o.status));
  const historyOrders = orders.filter((o) => ["SERVED", "CANCELLED"].includes(o.status));

  const changeStatus = (orderId: string, status: string) => {
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, status as OrderStatus);
      if (res.success) {
        toast.success(res.message);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        );
      } else toast.error(res.message);
    });
  };

  return (
    <div className="space-y-8">
      <section>
        <h3 className="font-heading text-xl">Live queue ({activeOrders.length})</h3>
        <p className="text-sm text-muted">Auto-refreshes every 7 seconds</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {activeOrders.length === 0 && (
            <p className="col-span-full rounded-2xl border border-dashed border-border py-12 text-center text-muted">
              No active orders. New table orders will appear here.
            </p>
          )}
          {activeOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              readOnly={readOnly}
              pending={pending}
              onStatusChange={changeStatus}
            />
          ))}
        </div>
      </section>

      {historyOrders.length > 0 && (
        <section>
          <h3 className="font-heading text-xl">Recent completed</h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {historyOrders.slice(0, 10).map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                readOnly={readOnly}
                pending={pending}
                onStatusChange={changeStatus}
                compact
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function OrderCard({
  order,
  readOnly,
  pending,
  onStatusChange,
  compact = false,
}: {
  order: Order;
  readOnly: boolean;
  pending: boolean;
  onStatusChange: (id: string, status: string) => void;
  compact?: boolean;
}) {
  const next = NEXT_STATUS[order.status];
  const time = new Date(order.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article className="rounded-2xl border border-border bg-background p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">Order #{order.orderNumber}</p>
          <h4 className="font-heading text-2xl">Table {order.tableNumber}</h4>
          {order.diningTable?.label && (
            <p className="text-sm text-muted">{order.diningTable.label}</p>
          )}
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[order.status] || "bg-gray-100"}`}
        >
          {order.status}
        </span>
      </div>

      <p className="mt-2 text-xs text-muted">{time}</p>
      {order.guestName && <p className="text-sm">{order.guestName}</p>}
      {order.guestPhone && <p className="text-sm text-muted">{order.guestPhone}</p>}

      <ul className="mt-4 space-y-3 border-t border-border pt-4">
        {order.items.map((item) => (
          <li key={item.id}>
            <div className="flex justify-between gap-2">
              <span className="font-medium">
                {item.quantity}× {item.name}
              </span>
              {!compact && <span className="text-sm">{formatPrice(item.lineTotal)}</span>}
            </div>
            {item.modifiers.length > 0 && (
              <ul className="mt-1 space-y-0.5 pl-2 text-xs text-muted">
                {item.modifiers.map((m) => (
                  <li key={m.id}>
                    {m.type === "ADD" ? "+" : "−"} {m.name}
                    {m.priceDelta > 0 ? ` (${formatPrice(m.priceDelta)})` : ""}
                  </li>
                ))}
              </ul>
            )}
            {item.note && (
              <p className="mt-1 text-xs italic text-muted">Note: {item.note}</p>
            )}
          </li>
        ))}
      </ul>

      {order.note && (
        <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-sm text-muted">
          Order note: {order.note}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <span className="font-heading text-lg">{formatPrice(order.total)}</span>
        {!readOnly && order.status !== "SERVED" && order.status !== "CANCELLED" && (
          <div className="flex gap-2">
            {next && (
              <Button
                size="sm"
                disabled={pending}
                onClick={() => onStatusChange(order.id, next)}
              >
                → {next}
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              disabled={pending}
              onClick={() => onStatusChange(order.id, "CANCELLED")}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
