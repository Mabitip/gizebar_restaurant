"use server";

import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { rolesFor } from "@/lib/permissions";
import { createOrderSchema } from "@/lib/validations";

function fail(message: string) {
  return { success: false as const, message };
}

function ok<T extends Record<string, unknown>>(message: string, data?: T) {
  return { success: true as const, message, ...data };
}

async function nextOrderNumber(): Promise<number> {
  const latest = await prisma.order.findFirst({
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });
  return (latest?.orderNumber ?? 1000) + 1;
}

export async function createOrder(input: unknown) {
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid order data");

  const { tableNumber, qrToken, guestName, guestPhone, note, items } = parsed.data;

  try {
    let diningTableId: string | null = null;
    if (qrToken) {
      const table = await prisma.diningTable.findFirst({
        where: { qrToken, isActive: true },
      });
      if (table) diningTableId = table.id;
    }

    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        status: "PUBLISHED",
        isAvailable: true,
      },
      include: {
        modifiers: { where: { isActive: true } },
      },
    });

    if (menuItems.length !== new Set(menuItemIds).size) {
      return fail("Some menu items are unavailable");
    }

    const menuMap = Object.fromEntries(menuItems.map((m) => [m.id, m]));
    let subtotal = 0;

    const orderItemsData = items.map((item) => {
      const menuItem = menuMap[item.menuItemId];
      const modifierTotal = (item.modifiers || []).reduce((sum, m) => sum + m.priceDelta, 0);
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
        modifiers: (item.modifiers || []).map((m) => ({
          name: m.name,
          type: m.type,
          priceDelta: m.priceDelta,
        })),
      };
    });

    const orderNumber = await nextOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        tableNumber,
        diningTableId,
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
      },
      include: {
        items: { include: { modifiers: true } },
      },
    });

    revalidatePath("/admin/orders");

    return {
      success: true as const,
      message: "Order placed successfully",
      orderId: order.id,
      orderNumber: order.orderNumber,
    };
  } catch {
    return fail("Could not place order. Please try again.");
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await requireSession(rolesFor("orders", "write"));

  try {
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

export async function resolveTableByToken(token: string) {
  try {
    const table = await prisma.diningTable.findFirst({
      where: { qrToken: token, isActive: true },
    });
    if (!table) return null;
    return { id: table.id, number: table.number, label: table.label, zone: table.zone };
  } catch {
    return null;
  }
}
