"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  className?: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  getValue?: (row: T) => string | number | boolean | null | undefined;
};

type Props<T extends { id: string }> = {
  rows: T[];
  columns: DataTableColumn<T>[];
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  pageSize?: number;
  onBulkDelete?: (ids: string[]) => void;
  toolbar?: React.ReactNode;
  emptyMessage?: string;
};

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  searchPlaceholder = "Search…",
  searchKeys,
  pageSize = 10,
  onBulkDelete,
  toolbar,
  emptyMessage = "No records found.",
}: Props<T>) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    let list = rows;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((row) => {
        if (searchKeys?.length) {
          return searchKeys.some((k) =>
            String(row[k] ?? "")
              .toLowerCase()
              .includes(q)
          );
        }
        return columns.some((col) => {
          const val = col.getValue?.(row) ?? (row as Record<string, unknown>)[col.key];
          return String(val ?? "")
            .toLowerCase()
            .includes(q);
        });
      });
    }
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      list = [...list].sort((a, b) => {
        const av = col?.getValue?.(a) ?? (a as Record<string, unknown>)[sortKey];
        const bv = col?.getValue?.(b) ?? (b as Record<string, unknown>)[sortKey];
        const as = String(av ?? "");
        const bs = String(bv ?? "");
        const cmp = as.localeCompare(bs, undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return list;
  }, [rows, search, searchKeys, columns, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice(page * pageSize, page * pageSize + pageSize);

  const toggleAll = () => {
    if (selected.length === pageRows.length) setSelected([]);
    else setSelected(pageRows.map((r) => r.id));
  };

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const onSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="max-w-sm"
        />
        <div className="flex flex-wrap items-center gap-2">
          {onBulkDelete && selected.length > 0 && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                onBulkDelete(selected);
                setSelected([]);
              }}
            >
              Delete ({selected.length})
            </Button>
          )}
          {toolbar}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-background shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-surface text-muted">
            <tr>
              {onBulkDelete && (
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={pageRows.length > 0 && selected.length === pageRows.length}
                    onChange={toggleAll}
                    aria-label="Select all"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 font-medium",
                    col.sortable && "cursor-pointer select-none hover:text-foreground",
                    col.className
                  )}
                  onClick={() => onSort(col.key, col.sortable)}
                >
                  {col.header}
                  {sortKey === col.key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (onBulkDelete ? 1 : 0)}
                  className="px-4 py-10 text-center text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
            {pageRows.map((row) => (
              <tr key={row.id} className="border-b border-border/60 hover:bg-surface/80">
                {onBulkDelete && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(row.id)}
                      onChange={() => toggle(row.id)}
                      aria-label="Select row"
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-4 py-3", col.className)}>
                    {col.render
                      ? col.render(row)
                      : String(
                          col.getValue?.(row) ??
                            (row as Record<string, unknown>)[col.key] ??
                            ""
                        )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted">
        <p>
          {filtered.length} record{filtered.length === 1 ? "" : "s"}
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>
          <span>
            {page + 1} / {pageCount}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= pageCount - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
      {status}
    </span>
  );
}
