import type { Metadata } from "next";
import { OrderBrowser } from "@/components/order/order-browser";
import { getCategories, getOrderMenuItems } from "@/lib/data";
import { resolveTableByToken } from "@/actions/orders";

export const metadata: Metadata = {
  title: "Order",
  description: "Order food and drinks from your table at Gize Bar & Restaurant.",
};

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const params = await searchParams;
  const token = params.t?.trim();

  const [items, categories, tableInfo] = await Promise.all([
    getOrderMenuItems(),
    getCategories(),
    token ? resolveTableByToken(token) : Promise.resolve(null),
  ]);

  return (
    <OrderBrowser
      items={items}
      categories={categories}
      tableInfo={
        tableInfo
          ? {
              number: tableInfo.number,
              label: tableInfo.label,
              zone: tableInfo.zone,
              qrToken: token,
            }
          : null
      }
    />
  );
}
