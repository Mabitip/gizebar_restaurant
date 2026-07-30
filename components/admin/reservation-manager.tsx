"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteReservations, updateReservationStatus } from "@/actions/admin";

type Reservation = {
  id: string;
  name: string;
  phone: string;
  email: string;
  guests: number;
  date: Date | string;
  time: string;
  specialRequests: string | null;
  status: string;
};

const statuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"];

export function ReservationManager({
  reservations,
  readOnly = false,
}: {
  reservations: Reservation[];
  readOnly?: boolean;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={!selected.length || pending}
            onClick={() =>
              startTransition(async () => {
                const res = await deleteReservations(selected);
                if (res.success) {
                  toast.success(res.message);
                  setSelected([]);
                } else toast.error(res.message);
              })
            }
          >
            Bulk Delete
          </Button>
        </div>
      )}
      <div className="overflow-x-auto rounded-2xl border border-border bg-background">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-surface text-muted">
            <tr>
              {!readOnly && <th className="p-3" />}
              <th className="p-3">Guest</th>
              <th className="p-3">Contact</th>
              <th className="p-3">When</th>
              <th className="p-3">Guests</th>
              <th className="p-3">Status</th>
              <th className="p-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length === 0 && (
              <tr>
                <td colSpan={readOnly ? 6 : 7} className="p-8 text-center text-muted">
                  No reservations yet.
                </td>
              </tr>
            )}
            {reservations.map((r) => (
              <tr key={r.id} className="border-t border-border/60">
                {!readOnly && (
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(r.id)}
                      onChange={() =>
                        setSelected((prev) =>
                          prev.includes(r.id)
                            ? prev.filter((x) => x !== r.id)
                            : [...prev, r.id]
                        )
                      }
                    />
                  </td>
                )}
                <td className="p-3 font-medium">{r.name}</td>
                <td className="p-3">
                  <div>{r.phone}</div>
                  <div className="text-muted">{r.email}</div>
                </td>
                <td className="p-3">
                  {new Date(r.date).toLocaleDateString()} · {r.time}
                </td>
                <td className="p-3">{r.guests}</td>
                <td className="p-3">
                  {readOnly ? (
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                      {r.status}
                    </span>
                  ) : (
                    <select
                      className="rounded-lg border border-border px-2 py-1"
                      value={r.status}
                      onChange={(e) =>
                        startTransition(async () => {
                          const res = await updateReservationStatus(r.id, e.target.value);
                          if (res.success) toast.success(res.message);
                          else toast.error(res.message);
                        })
                      }
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="max-w-xs truncate p-3 text-muted">
                  {r.specialRequests || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
