"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataToolbar } from "@/components/admin/data-toolbar";
import { DataTable, type Column } from "@/components/admin/data-table";
import { LiveBadge } from "@/components/admin/live-badge";
import { MetricState } from "@/components/admin/metric-state";
import { useAdminList } from "@/lib/admin-client";

type BranchRequest = { quantity: number; branch: string; address: string; reason?: string };
type PosRequest = {
  id: string;
  store_id: string;
  branches: BranchRequest[];
  status: string;
  submitted_at: string;
  reviewed_at?: string | null;
  review_note?: string | null;
  store_name: string;
  business_type: string;
  first_name: string;
  last_name: string;
  user_email: string;
  vendor_phone?: string | null;
};

const statusTabs = ["All", "pending", "approved", "declined"];

export default function PosRequestsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);
  const state = useAdminList<PosRequest>("pos-requests", {
    search,
    status: status === "All" ? undefined : status,
    page,
  }, { limit: 25 });
  const rows = state.rows ?? [];

  async function review(request: PosRequest, decision: "approved" | "declined") {
    let review_note = "";
    if (decision === "declined") {
      const entered = window.prompt("Optional note for this decline:");
      if (entered === null) return;
      review_note = entered.trim();
    } else if (!window.confirm(`Approve the POS request for ${request.store_name}?`)) {
      return;
    }

    setBusyId(request.id);
    try {
      const response = await fetch(`/api/admin/pos-requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: decision, review_note }),
      });
      const result = await response.json();
      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "Could not update this POS request");
      }
      toast.success(`POS request ${decision}`);
      state.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update this POS request");
    } finally {
      setBusyId(null);
    }
  }

  const columns: Column<PosRequest>[] = [
    {
      key: "store_name",
      header: "Vendor / Store",
      render: (row) => <div className="min-w-48"><p className="font-medium">{row.store_name}</p><p className="text-xs text-muted-foreground">{[row.first_name, row.last_name].filter(Boolean).join(" ") || row.user_email}</p><p className="text-xs text-muted-foreground">{row.user_email}{row.vendor_phone ? ` · ${row.vendor_phone}` : ""}</p></div>,
    },
    {
      key: "branches",
      header: "Terminal request details",
      sortable: false,
      render: (row) => <div className="min-w-64 space-y-3">{row.branches.map((branch, index) => <div key={`${row.id}-${index}`} className="border-l-2 border-primary/30 pl-3"><p className="text-sm font-medium">{branch.branch} · {branch.quantity} terminal{branch.quantity === 1 ? "" : "s"}</p><p className="text-xs text-muted-foreground">{branch.address}</p>{branch.reason && <p className="mt-1 text-xs">Reason: {branch.reason}</p>}</div>)}</div>,
    },
    { key: "business_type", header: "Business type" },
    { key: "submitted_at", header: "Submitted", render: row => new Date(row.submitted_at).toLocaleString() },
    { key: "status", header: "Status" },
    {
      key: "id",
      header: "Review",
      sortable: false,
      render: row => row.status === "pending" ? <div className="flex gap-2"><Button size="sm" disabled={busyId === row.id} onClick={() => review(row, "approved")}><Check className="mr-1 h-4 w-4" />Approve</Button><Button size="sm" variant="outline" disabled={busyId === row.id} onClick={() => review(row, "declined")}><X className="mr-1 h-4 w-4" />Decline</Button></div> : <span className="text-xs text-muted-foreground">{row.reviewed_at ? `Reviewed ${new Date(row.reviewed_at).toLocaleDateString()}` : "Reviewed"}{row.review_note ? ` · ${row.review_note}` : ""}</span>,
    },
  ];

  return <div className="space-y-5 p-4 sm:p-6">
    <header className="flex items-center justify-between gap-4"><div><h1 className="text-lg font-semibold">POS Requests</h1><p className="mt-1 text-xs text-muted-foreground">Review terminal requests submitted by vendor accounts.</p></div><LiveBadge live={state.live} loading={state.loading} /></header>
    <DataToolbar search={search} onSearchChange={value => { setSearch(value); setPage(1); }} searchPlaceholder="Search vendor, store or email..." tabs={statusTabs} activeTab={status} onTabChange={value => { setStatus(value); setPage(1); }} showExport={false} />
    <MetricState loading={state.loading} error={state.error} refresh={state.refresh} empty={!rows.length}>
      <DataTable columns={columns} rows={rows} emptyMessage="No POS requests match these filters" />
    </MetricState>
    {state.live && state.lastPage > 1 && <div className="flex items-center justify-end gap-3 text-sm"><span>Page {page} of {state.lastPage}</span><Button variant="outline" size="sm" disabled={state.loading || page <= 1} onClick={() => setPage(value => Math.max(1, value - 1))}>Previous</Button><Button variant="outline" size="sm" disabled={state.loading || page >= state.lastPage} onClick={() => setPage(value => Math.min(state.lastPage, value + 1))}>Next</Button></div>}
  </div>;
}
