"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function AdminCharts({
  menu,
  reservations,
  events,
  gallery,
}: {
  menu: number;
  reservations: number;
  events: number;
  gallery: number;
}) {
  const data = [
    { name: "Menu", value: menu },
    { name: "Reservations", value: reservations },
    { name: "Events", value: events },
    { name: "Gallery", value: gallery },
  ];

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
      <h3 className="font-heading text-xl">Content Overview</h3>
      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#d70102" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
