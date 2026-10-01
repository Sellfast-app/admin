"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

export interface Column<T> {
  key: Extract<keyof T, string>;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

type SortDir = "asc" | "desc";

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
}

const successStates = ["completed", "successful", "paid", "active", "delivered", "resolved"];
const warningStates = ["pending", "processing", "in transit", "open", "trialing", "scheduled"];
const dangerStates = ["failed", "cancelled", "suspended", "overdue", "flagged"];

function StateBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const variant = successStates.includes(normalized)
    ? "success"
    : dangerStates.includes(normalized)
      ? "destructive"
      : warningStates.includes(normalized)
        ? "secondary"
        : "outline";

  return (
    <Badge
      variant={variant === "success" ? "default" : variant}
      className={
        variant === "success"
          ? "bg-primary/10 text-primary hover:bg-primary/15"
          : variant === "secondary"
            ? "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300"
            : ""
      }
    >
      {value}
    </Badge>
  );
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  emptyMessage = "No records found",
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sortKey as keyof T] as string | number;
      const bv = b[sortKey as keyof T] as string | number;
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rows, sortKey, sortDir]);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key}>
                {col.sortable === false ? (
                  col.header
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleSort(col.key)}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    {col.header}
                    {sortKey === col.key ? (
                      sortDir === "asc" ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-40" />
                    )}
                  </button>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-28 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            sortedRows.map((row) => (
              <TableRow key={row.id}>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    {col.render ? (
                      col.render(row)
                    ) : typeof row[col.key] === "number" ? (
                      row[col.key] as React.ReactNode
                    ) : successStates.includes(String(row[col.key]).toLowerCase()) ||
                      warningStates.includes(String(row[col.key]).toLowerCase()) ||
                      dangerStates.includes(String(row[col.key]).toLowerCase()) ? (
                      <StateBadge value={String(row[col.key])} />
                    ) : (
                      String(row[col.key] ?? "—")
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
