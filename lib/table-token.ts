/** Shared helpers for dining-table QR resolution (not a server action). */

import { prisma } from "@/lib/prisma";

export async function resolveTableByToken(token: string) {
  try {
    const table = await prisma.diningTable.findFirst({
      where: { qrToken: token, isActive: true },
    });
    if (!table) return null;
    return {
      id: table.id,
      number: table.number,
      label: table.label,
      zone: table.zone,
      qrToken: table.qrToken,
    };
  } catch {
    return null;
  }
}
