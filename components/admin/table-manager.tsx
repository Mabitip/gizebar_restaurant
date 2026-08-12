"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Download, Printer, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteDiningTables,
  regenerateTableQrToken,
  upsertDiningTable,
} from "@/actions/admin";
import { qrMenuUrl } from "@/lib/utils";

type DiningTable = {
  id: string;
  number: number;
  label: string | null;
  zone: string | null;
  qrToken: string;
  isActive: boolean;
};

function QrPreview({ url, size = 160 }: { url: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: size,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    }).catch(() => {});
  }, [url, size]);

  return <canvas ref={canvasRef} className="rounded-lg" />;
}

function QrActions({ table }: { table: DiningTable }) {
  const url = qrMenuUrl();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, { width: 200, margin: 2 }).catch(() => {});
  }, [url]);

  const download = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `gize-table-${table.number}-qr.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const print = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    const dataUrl = canvasRef.current?.toDataURL("image/png") || "";
    win.document.write(`
      <!DOCTYPE html>
      <html><head><title>Table ${table.number} QR</title>
      <style>
        body { font-family: system-ui, sans-serif; text-align: center; padding: 40px; }
        img { width: 280px; height: 280px; }
        h1 { font-size: 28px; margin: 24px 0 8px; }
        p { color: #666; font-size: 14px; }
      </style></head>
      <body>
        <h1>Table ${table.number}</h1>
        ${table.label ? `<p>${table.label}</p>` : ""}
        ${table.zone ? `<p>${table.zone}</p>` : ""}
        <img src="${dataUrl}" alt="QR Code" />
        <p>Scan to view menu</p>
        <script>window.onload = () => { window.print(); }</script>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas ref={canvasRef} className="hidden" />
      <QrPreview url={url} size={120} />
      <p className="max-w-[140px] truncate text-[10px] text-muted">{url}</p>
      <div className="flex flex-wrap justify-center gap-1">
        <Button size="sm" variant="secondary" onClick={download}>
          <Download className="mr-1 h-3 w-3" /> PNG
        </Button>
        <Button size="sm" variant="secondary" onClick={print}>
          <Printer className="mr-1 h-3 w-3" /> Print
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await regenerateTableQrToken(table.id);
              if (res.success) toast.success(res.message);
              else toast.error(res.message);
            })
          }
        >
          <RefreshCw className="mr-1 h-3 w-3" /> New QR
        </Button>
      </div>
    </div>
  );
}

export function TableManager({
  tables,
  readOnly = false,
}: {
  tables: DiningTable[];
  readOnly?: boolean;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    number: 1,
    label: "",
    zone: "",
    isActive: true,
  });

  const save = () => {
    startTransition(async () => {
      const res = await upsertDiningTable({
        number: form.number,
        label: form.label || null,
        zone: form.zone || null,
        isActive: form.isActive,
      });
      if (res.success) {
        toast.success(res.message);
        setCreating(false);
        setForm({ number: tables.length + 1, label: "", zone: "", isActive: true });
      } else toast.error(res.message);
    });
  };

  return (
    <div className="space-y-6">
      {!readOnly && (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setCreating((v) => !v)}>
            {creating ? "Cancel" : "Add Table"}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={!selected.length || pending}
            onClick={() =>
              startTransition(async () => {
                const res = await deleteDiningTables(selected);
                if (res.success) {
                  toast.success(res.message);
                  setSelected([]);
                } else toast.error(res.message);
              })
            }
          >
            Delete Selected
          </Button>
        </div>
      )}

      {creating && !readOnly && (
        <div className="rounded-2xl border border-border bg-background p-6">
          <h3 className="font-heading text-lg">New table</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Table number</Label>
              <Input
                type="number"
                min={1}
                value={form.number}
                onChange={(e) => setForm({ ...form, number: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Label (optional)</Label>
              <Input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="Window seat"
              />
            </div>
            <div className="space-y-2">
              <Label>Zone (optional)</Label>
              <Input
                value={form.zone}
                onChange={(e) => setForm({ ...form, zone: e.target.value })}
                placeholder="Main floor"
              />
            </div>
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active
          </label>
          <Button className="mt-4" disabled={pending} onClick={save}>
            Save table
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.length === 0 && (
          <p className="col-span-full py-12 text-center text-muted">
            No tables yet. Add tables to generate QR codes.
          </p>
        )}
        {tables.map((table) => (
          <div
            key={table.id}
            className="rounded-2xl border border-border bg-background p-4"
          >
            {!readOnly && (
              <input
                type="checkbox"
                className="mb-2"
                checked={selected.includes(table.id)}
                onChange={() =>
                  setSelected((prev) =>
                    prev.includes(table.id)
                      ? prev.filter((x) => x !== table.id)
                      : [...prev, table.id]
                  )
                }
                aria-label={`Select table ${table.number}`}
              />
            )}
            <div className="text-center">
              <p className="font-heading text-2xl">Table {table.number}</p>
              {table.label && <p className="text-sm text-muted">{table.label}</p>}
              {table.zone && <p className="text-xs text-muted">{table.zone}</p>}
              {!table.isActive && (
                <span className="mt-1 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                  Inactive
                </span>
              )}
            </div>
            <div className="mt-4 flex justify-center">
              <QrActions table={table} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
