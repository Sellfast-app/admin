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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
  assigned_terminal_count?: number;
};
type TerminalAssignment = { request_branch_index: number; branch: string; address: string; posid: string; serial_number: string };

const statusTabs = ["All", "pending", "approved", "declined"];

export default function PosRequestsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [approvalRequest, setApprovalRequest] = useState<PosRequest | null>(null);
  const [assignments, setAssignments] = useState<TerminalAssignment[]>([]);
  const state = useAdminList<PosRequest>("pos-requests", {
    search,
    status: status === "All" ? undefined : status,
    page,
  }, { limit: 25 });
  const rows = state.rows ?? [];

  function beginApproval(request: PosRequest) {
    const entries = request.branches.flatMap((branch, branchIndex) => Array.from({ length: branch.quantity }, () => ({
      request_branch_index: branchIndex,
      branch: branch.branch,
      address: branch.address,
      posid: "",
      serial_number: "",
    })));
    setApprovalRequest(request);
    setAssignments(entries);
  }

  async function review(request: PosRequest, decision: "approved" | "declined", terminals?: TerminalAssignment[]) {
    let review_note = "";
    if (decision === "declined") {
      const entered = window.prompt("Optional note for this decline:");
      if (entered === null) return;
      review_note = entered.trim();
    }

    setBusyId(request.id);
    try {
      const response = await fetch(`/api/admin/pos-requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: decision,
          review_note,
          ...(decision === "approved" ? { terminals: terminals?.map(({ request_branch_index, posid, serial_number }) => ({ request_branch_index, posid, serial_number })) } : {}),
        }),
      });
      const result = await response.json();
      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "Could not update this POS request");
      }
      toast.success(request.status === "approved" ? "POS terminals assigned" : `POS request ${decision}`);
      setApprovalRequest(null);
      setAssignments([]);
      state.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update this POS request");
    } finally {
      setBusyId(null);
    }
  }

  function submitApproval() {
    if (!approvalRequest) return;
    if (assignments.some(terminal => !terminal.posid.trim() || !terminal.serial_number.trim())) {
      toast.error("Enter both the SeerBit POS ID and serial number for every terminal.");
      return;
    }
    void review(approvalRequest, "approved", assignments);
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
      render: row => row.status === "pending" || (row.status === "approved" && Number(row.assigned_terminal_count || 0) === 0)
        ? <div className="flex gap-2"><Button size="sm" disabled={busyId === row.id} onClick={() => beginApproval(row)}><Check className="mr-1 h-4 w-4" />{row.status === "approved" ? "Assign terminals" : "Assign & approve"}</Button>{row.status === "pending" && <Button size="sm" variant="outline" disabled={busyId === row.id} onClick={() => review(row, "declined")}><X className="mr-1 h-4 w-4" />Decline</Button>}</div>
        : <span className="text-xs text-muted-foreground">{row.status === "approved" ? `${row.assigned_terminal_count || 0} terminal(s) assigned` : row.reviewed_at ? `Reviewed ${new Date(row.reviewed_at).toLocaleDateString()}` : "Reviewed"}{row.review_note ? ` · ${row.review_note}` : ""}</span>,
    },
  ];

  return <div className="space-y-5 p-4 sm:p-6">
    <header className="flex items-center justify-between gap-4"><div><h1 className="text-lg font-semibold">POS Requests</h1><p className="mt-1 text-xs text-muted-foreground">Review terminal requests submitted by vendor accounts.</p></div><LiveBadge live={state.live} loading={state.loading} /></header>
    <DataToolbar search={search} onSearchChange={value => { setSearch(value); setPage(1); }} searchPlaceholder="Search vendor, store or email..." tabs={statusTabs} activeTab={status} onTabChange={value => { setStatus(value); setPage(1); }} showExport={false} />
    <MetricState loading={state.loading} error={state.error} refresh={state.refresh} empty={!rows.length}>
      <DataTable columns={columns} rows={rows} emptyMessage="No POS requests match these filters" />
    </MetricState>
    {state.live && state.lastPage > 1 && <div className="flex items-center justify-end gap-3 text-sm"><span>Page {page} of {state.lastPage}</span><Button variant="outline" size="sm" disabled={state.loading || page <= 1} onClick={() => setPage(value => Math.max(1, value - 1))}>Previous</Button><Button variant="outline" size="sm" disabled={state.loading || page >= state.lastPage} onClick={() => setPage(value => Math.min(state.lastPage, value + 1))}>Next</Button></div>}
    <Dialog open={Boolean(approvalRequest)} onOpenChange={open => { if (!open && !busyId) setApprovalRequest(null); }}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader><DialogTitle>Assign SeerBit terminals</DialogTitle><DialogDescription>Enter the terminal identifiers supplied by SeerBit. Each terminal will be linked to this vendor store and the requested branch.</DialogDescription></DialogHeader>
        <div className="space-y-4">
          {assignments.map((assignment, index) => <section key={`${assignment.request_branch_index}-${index}`} className="space-y-3 rounded-md border p-3">
            <div><p className="text-sm font-medium">{assignment.branch} · Terminal {assignments.slice(0, index + 1).filter(item => item.request_branch_index === assignment.request_branch_index).length}</p><p className="text-xs text-muted-foreground">{assignment.address}</p></div>
            <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1.5 text-sm">SeerBit POS ID<Input value={assignment.posid} maxLength={120} onChange={event => setAssignments(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, posid: event.target.value } : item))} placeholder="e.g. terminal ID from SeerBit" /></label><label className="space-y-1.5 text-sm">Serial number<Input value={assignment.serial_number} maxLength={120} onChange={event => setAssignments(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, serial_number: event.target.value } : item))} placeholder="Device serial number" /></label></div>
          </section>)}
        </div>
        <DialogFooter><Button variant="outline" disabled={Boolean(busyId)} onClick={() => setApprovalRequest(null)}>Cancel</Button><Button disabled={Boolean(busyId)} onClick={submitApproval}>{busyId ? "Saving assignment..." : "Assign terminals and approve"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </div>;
}
