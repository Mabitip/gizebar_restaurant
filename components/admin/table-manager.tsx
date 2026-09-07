"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import {
  Check,
  Copy,
  Download,
  Edit2,
  ExternalLink,
  Plus,
  Printer,
  Sparkles,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteDiningTables,
  upsertDiningTable,
} from "@/actions/admin";
import { qrMenuUrl, SITE } from "@/lib/utils";

export type DiningTable = {
  id: string;
  number: number;
  label: string | null;
  zone: string | null;
  qrToken: string;
  isActive: boolean;
};

export function TableManager({
  tables,
  readOnly = false,
}: {
  tables: DiningTable[];
  readOnly?: boolean;
}) {
  const masterUrl = qrMenuUrl();
  const [selected, setSelected] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [editingTable, setEditingTable] = useState<DiningTable | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const [form, setForm] = useState({
    number: tables.length > 0 ? Math.max(...tables.map((t) => t.number)) + 1 : 1,
    label: "",
    zone: "",
    isActive: true,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const standCanvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR Canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, masterUrl, {
      width: 240,
      margin: 2,
      color: {
        dark: "#171717",
        light: "#ffffff",
      },
    }).catch(console.error);

    if (!standCanvasRef.current) return;
    QRCode.toCanvas(standCanvasRef.current, masterUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: "#171717",
        light: "#ffffff",
      },
    }).catch(console.error);
  }, [masterUrl]);

  const copyMenuLink = () => {
    navigator.clipboard.writeText(masterUrl);
    setCopied(true);
    toast.success("Public Menu URL copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMasterQrPng = () => {
    if (!standCanvasRef.current) return;
    const link = document.createElement("a");
    link.download = `gize-universal-menu-qr.png`;
    link.href = standCanvasRef.current.toDataURL("image/png");
    link.click();
    toast.success("High-res QR code downloaded!");
  };

  const printTableStand = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    const dataUrl = standCanvasRef.current?.toDataURL("image/png") || canvasRef.current?.toDataURL("image/png") || "";

    win.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Gize Bar & Restaurant - Tabletop Menu Stand</title>
        <style>
          @page { size: auto; margin: 15mm; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #ffffff;
            color: #1a1a1a;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
          }
          .stand-card {
            width: 380px;
            border: 2px solid #e5e5e5;
            border-radius: 24px;
            padding: 36px 28px;
            text-align: center;
            background: #faf9f6;
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
            position: relative;
          }
          .gold-border {
            position: absolute;
            inset: 8px;
            border: 1px solid #d4af37;
            border-radius: 18px;
            pointer-events: none;
          }
          .brand-badge {
            display: inline-block;
            background: #c59b27;
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
            padding: 4px 14px;
            border-radius: 20px;
            margin-bottom: 12px;
          }
          h1 {
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.5px;
            color: #111111;
            margin-bottom: 4px;
          }
          .tagline {
            font-size: 12px;
            color: #777777;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 20px;
          }
          .qr-frame {
            background: #ffffff;
            padding: 16px;
            border-radius: 20px;
            display: inline-block;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            border: 1px solid #eaeaea;
            margin-bottom: 20px;
          }
          .qr-frame img {
            width: 220px;
            height: 220px;
            display: block;
          }
          .instruction {
            font-size: 15px;
            font-weight: 700;
            color: #111111;
            margin-bottom: 6px;
          }
          .sub-instruction {
            font-size: 12px;
            color: #666666;
            line-height: 1.5;
            margin-bottom: 18px;
          }
          .table-prompt {
            background: #ffffff;
            border: 1px dashed #d4af37;
            border-radius: 12px;
            padding: 8px 14px;
            font-size: 12px;
            font-weight: 600;
            color: #927218;
            margin-bottom: 16px;
          }
          .footer-info {
            font-size: 11px;
            color: #888888;
            border-top: 1px solid #e5e5e5;
            padding-top: 12px;
          }
        </style>
      </head>
      <body>
        <div class="stand-card">
          <div class="gold-border"></div>
          <span class="brand-badge">Welcome</span>
          <h1>${SITE.name}</h1>
          <p class="tagline">Bole, Addis Ababa</p>

          <div class="qr-frame">
            <img src="${dataUrl}" alt="Digital Menu QR" />
          </div>

          <p class="instruction">Scan to View Live Menu & Order</p>
          <p class="sub-instruction">Open your phone camera to browse food, signature cocktails, and place your order instantly.</p>

          <div class="table-prompt">
            ✨ Enter your Table Number at checkout
          </div>

          <div class="footer-info">
            <p><strong>Wi-Fi:</strong> Gize_Guest &nbsp;|&nbsp; <strong>Pass:</strong> GizeAddis2024</p>
          </div>
        </div>

        <script>
          window.onload = () => {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    win.document.close();
  };

  const handleSave = () => {
    startTransition(async () => {
      const res = await upsertDiningTable({
        id: editingTable?.id,
        number: Number(form.number),
        label: form.label || null,
        zone: form.zone || null,
        isActive: form.isActive,
      });
      if (res.success) {
        toast.success(res.message);
        setCreating(false);
        setEditingTable(null);
        setForm({
          number: tables.length > 0 ? Math.max(...tables.map((t) => t.number)) + 1 : 1,
          label: "",
          zone: "",
          isActive: true,
        });
      } else {
        toast.error(res.message);
      }
    });
  };

  const openEdit = (t: DiningTable) => {
    setEditingTable(t);
    setCreating(true);
    setForm({
      number: t.number,
      label: t.label || "",
      zone: t.zone || "",
      isActive: t.isActive,
    });
  };

  const handleDeleteSelected = () => {
    if (!selected.length) return;
    if (!confirm(`Are you sure you want to delete ${selected.length} table(s)?`)) return;

    startTransition(async () => {
      const res = await deleteDiningTables(selected);
      if (res.success) {
        toast.success(res.message);
        setSelected([]);
      } else {
        toast.error(res.message);
      }
    });
  };

  const toggleSelectAll = () => {
    if (selected.length === tables.length) {
      setSelected([]);
    } else {
      setSelected(tables.map((t) => t.id));
    }
  };

  const activeCount = tables.filter((t) => t.isActive).length;

  return (
    <div className="space-y-8">
      {/* Hidden high-res canvas for exports */}
      <canvas ref={standCanvasRef} className="hidden" />

      {/* ─── Master Universal QR Hero Suite ─── */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface via-background to-surface p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              One Master QR For All Tables
            </div>

            <h3 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Universal Digital Menu & Ordering QR
            </h3>

            <p className="text-sm leading-relaxed text-muted">
              Place this one master QR code on all tables across your restaurant. When guests scan it, they instantly access the complete digital menu and can place orders by specifying their table number.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                type="button"
                onClick={printTableStand}
                className="shadow-md shadow-primary/20"
              >
                <Printer className="mr-2 h-4 w-4" />
                Print Tabletop Stand
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={downloadMasterQrPng}
              >
                <Download className="mr-2 h-4 w-4" />
                Download High-Res PNG
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={copyMenuLink}
                className="text-xs"
              >
                {copied ? (
                  <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                )}
                {copied ? "Copied Link!" : "Copy Link"}
              </Button>

              <a
                href={masterUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted hover:text-primary transition"
              >
                <ExternalLink className="h-3 w-3" />
                Preview Menu Page
              </a>
            </div>

            <div className="rounded-xl border border-border/70 bg-background/60 p-3 text-xs text-muted">
              <strong>Live Target URL:</strong> <code className="text-foreground">{masterUrl}</code>
            </div>
          </div>

          {/* QR Stand Preview Card */}
          <div className="flex shrink-0 flex-col items-center justify-center rounded-2xl border border-border bg-background p-6 shadow-md">
            <div className="relative rounded-xl border border-border/80 bg-white p-3 shadow-inner">
              <canvas ref={canvasRef} className="rounded-lg" />
            </div>
            <p className="mt-3 font-heading text-sm font-semibold text-foreground">
              {SITE.name}
            </p>
            <p className="text-[11px] text-muted">Scan to View Menu & Order</p>
          </div>
        </div>
      </section>

      {/* ─── Add / Edit Table Form ─── */}
      {creating && !readOnly && (
        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
          <h3 className="font-heading text-xl font-semibold">
            {editingTable ? `Edit Table ${editingTable.number}` : "Add New Table"}
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Table Number</Label>
              <Input
                type="number"
                min={1}
                value={form.number}
                onChange={(e) => setForm({ ...form, number: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Label / Seating Type (Optional)</Label>
              <Input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="e.g. Window Booth, Round Table"
              />
            </div>
            <div className="space-y-2">
              <Label>Zone / Area (Optional)</Label>
              <Input
                value={form.zone}
                onChange={(e) => setForm({ ...form, zone: e.target.value })}
                placeholder="e.g. Main Floor, Patio, VIP Lounge"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="activeCheckbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <Label htmlFor="activeCheckbox" className="cursor-pointer text-sm font-medium">
              Table is active & ready for orders
            </Label>
          </div>

          <div className="mt-6 flex gap-3">
            <Button disabled={pending} onClick={handleSave}>
              {editingTable ? "Update Table" : "Save Table"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setCreating(false);
                setEditingTable(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* ─── Streamlined Tables List & Management ─── */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-heading text-xl font-semibold text-foreground">
              Dining Tables ({tables.length})
            </h3>
            <p className="text-xs text-muted">
              {activeCount} active tables ready in restaurant
            </p>
          </div>

          {!readOnly && (
            <div className="flex flex-wrap items-center gap-2">
              {selected.length > 0 && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-destructive hover:text-destructive"
                  disabled={pending}
                  onClick={handleDeleteSelected}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete ({selected.length})
                </Button>
              )}

              <Button
                size="sm"
                onClick={() => {
                  setEditingTable(null);
                  setCreating(true);
                  setForm({
                    number: tables.length > 0 ? Math.max(...tables.map((t) => t.number)) + 1 : 1,
                    label: "",
                    zone: "",
                    isActive: true,
                  });
                }}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Add Table
              </Button>
            </div>
          )}
        </div>

        {/* Tabular Table View */}
        <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface/60 text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  {!readOnly && (
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={tables.length > 0 && selected.length === tables.length}
                        onChange={toggleSelectAll}
                        aria-label="Select all tables"
                        className="h-4 w-4 rounded border-border"
                      />
                    </th>
                  )}
                  <th className="px-4 py-3">Table Number</th>
                  <th className="px-4 py-3">Label / Description</th>
                  <th className="px-4 py-3">Zone / Section</th>
                  <th className="px-4 py-3">Status</th>
                  {!readOnly && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tables.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted">
                      <UtensilsCrossed className="mx-auto h-8 w-8 opacity-40 mb-2" />
                      <p className="font-medium">No dining tables configured</p>
                      <p className="text-xs">Click &ldquo;Add Table&rdquo; to add tables for your restaurant.</p>
                    </td>
                  </tr>
                ) : (
                  tables.map((t) => {
                    const isChecked = selected.includes(t.id);
                    return (
                      <tr
                        key={t.id}
                        className={`transition hover:bg-surface/40 ${
                          isChecked ? "bg-primary/5" : ""
                        }`}
                      >
                        {!readOnly && (
                          <td className="px-4 py-3.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() =>
                                setSelected((prev) =>
                                  prev.includes(t.id)
                                    ? prev.filter((id) => id !== t.id)
                                    : [...prev, t.id]
                                )
                              }
                              aria-label={`Select table ${t.number}`}
                              className="h-4 w-4 rounded border-border"
                            />
                          </td>
                        )}

                        <td className="px-4 py-3.5 font-heading font-semibold text-base text-foreground">
                          Table {t.number}
                        </td>

                        <td className="px-4 py-3.5 text-muted">
                          {t.label || <span className="text-muted/50">—</span>}
                        </td>

                        <td className="px-4 py-3.5 text-muted">
                          {t.zone ? (
                            <span className="inline-flex items-center rounded-md bg-surface px-2.5 py-1 text-xs font-medium text-foreground">
                              {t.zone}
                            </span>
                          ) : (
                            <span className="text-muted/50">—</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              t.isActive
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                t.isActive ? "bg-emerald-500" : "bg-destructive"
                              }`}
                            />
                            {t.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {!readOnly && (
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2 text-xs"
                                onClick={() => openEdit(t)}
                              >
                                <Edit2 className="h-3.5 w-3.5 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
