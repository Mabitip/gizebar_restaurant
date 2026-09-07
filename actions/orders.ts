"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { rolesFor } from "@/lib/permissions";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { createOrderSchema } from "@/lib/validations";
import { resolveTableByToken } from "@/lib/table-token";

function fail(message: string) {
  return { success: false as const, message };
}

function ok<T extends Record<string, unknown>>(message: string, data?: T) {
  return { success: true as const, message, ...data };
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "ACCEPTED",
  ACCEPTED: "PREPARING",
  PREPARING: "READY",
  READY: "SERVED",
};

function isAllowedTransition(from: OrderStatus, to: OrderStatus) {
  if (to === "CANCELLED") {
    return from !== "SERVED" && from !== "CANCELLED";
  }
  return NEXT_STATUS[from] === to;
}

async function nextOrderNumber(): Promise<number> {
  const latest = await prisma.order.findFirst({
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });
  return (latest?.orderNumber ?? 1000) + 1;
}

async function createOrderWithRetry(
  data: Omit<Prisma.OrderCreateInput, "orderNumber">,
  attempts = 5
) {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const orderNumber = await nextOrderNumber();
      return await prisma.order.create({
        data: { ...data, orderNumber },
        include: {
          items: { include: { modifiers: true } },
        },
      });
    } catch (error) {
      lastError = error;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export async function createOrder(input: unknown) {
  const h = await headers();
  const ip = clientIpFromHeaders(h);
  if (!rateLimit(`order:${ip}`, 10, 10 * 60_000).success) {
    return fail("Too many orders. Please wait a few minutes and try again.");
  }

  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid order data");

  const { qrToken, tableNumber: inputTableNumber, guestName, guestPhone, note, items } = parsed.data;

  try {
    let diningTableId: string | undefined;
    let tableNumber = inputTableNumber;

    if (qrToken && qrToken.trim() && qrToken !== "universal" && qrToken !== "master") {
      const table = await resolveTableByToken(qrToken);
      if (table) {
        diningTableId = table.id;
        tableNumber = table.number;
      }
    }

    if (!diningTableId && tableNumber) {
      const table = await prisma.diningTable.findFirst({
        where: { number: tableNumber, isActive: true },
      });
      if (table) {
        diningTableId = table.id;
      }
    }

    if (!rateLimit(`order-table:${tableNumber || ip}`, 15, 10 * 60_000).success) {
      return fail("Too many orders from this table. Please wait a few minutes.");
    }

    const menuItemIds = items.map((i) => i.menuItemId);
    const uniqueMenuIds = [...new Set(menuItemIds)];
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: uniqueMenuIds },
        status: "PUBLISHED",
        isAvailable: true,
      },
      include: {
        modifiers: { where: { isActive: true } },
      },
    });

    if (menuItems.length !== uniqueMenuIds.length) {
      return fail("Some menu items are unavailable");
    }

    const menuMap = Object.fromEntries(menuItems.map((m) => [m.id, m]));
    let subtotal = 0;

    const orderItemsData = items.map((item) => {
      const menuItem = menuMap[item.menuItemId]!;
      const modifierById = Object.fromEntries(
        menuItem.modifiers.map((m) => [m.id, m])
      );

      const resolvedModifiers = (item.modifiers || []).map((m) => {
        const dbMod = modifierById[m.modifierId];
        if (!dbMod) {
          throw new Error("INVALID_MODIFIER");
        }
        return {
          name: dbMod.name,
          type: dbMod.type,
          priceDelta: dbMod.priceDelta,
        };
      });

      const modifierTotal = resolvedModifiers.reduce(
        (sum, m) => sum + m.priceDelta,
        0
      );
      const unitPrice = menuItem.price + modifierTotal;
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      return {
        menuItemId: menuItem.id,
        name: menuItem.name,
        unitPrice,
        quantity: item.quantity,
        note: item.note || null,
        lineTotal,
        modifiers: resolvedModifiers,
      };
    });

    const order = await createOrderWithRetry({
      tableNumber,
      diningTable: { connect: { id: diningTableId } },
      guestName: guestName || null,
      guestPhone: guestPhone || null,
      note: note || null,
      subtotal,
      total: subtotal,
      items: {
        create: orderItemsData.map((item) => ({
          menuItemId: item.menuItemId,
          name: item.name,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          note: item.note,
          lineTotal: item.lineTotal,
          modifiers: {
            create: item.modifiers,
          },
        })),
      },
    });

    revalidatePath("/admin/orders");

    return {
      success: true as const,
      message: "Order placed successfully",
      orderId: order.id,
      orderNumber: order.orderNumber,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_MODIFIER") {
      return fail("Some item options are no longer available. Please customize again.");
    }
    return fail("Could not place order. Please try again.");
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await requireSession(rolesFor("orders", "write"));

  try {
    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });
    if (!existing) return fail("Order not found");

    if (!isAllowedTransition(existing.status, status)) {
      return fail(`Cannot change status from ${existing.status} to ${status}`);
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
    revalidatePath("/admin/orders");
    return ok("Order status updated");
  } catch {
    return fail("Could not update order status");
  }
}

export async function getActiveOrders() {
  await requireSession(rolesFor("orders", "read"));

  try {
    const orders = await prisma.order.findMany({
      where: {
        status: { notIn: ["SERVED", "CANCELLED"] },
      },
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { modifiers: true } },
        diningTable: true,
      },
    });
    return { success: true as const, orders };
  } catch {
    return { success: false as const, orders: [] };
  }
}

export async function getAllOrders(limit = 50) {
  await requireSession(rolesFor("orders", "read"));

  try {
    const orders = await prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { modifiers: true } },
        diningTable: true,
      },
    });
    return { success: true as const, orders };
  } catch {
    return { success: false as const, orders: [] };
  }
}
