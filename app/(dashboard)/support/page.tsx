"use client";

import { useMemo, useState } from "react";
import { DataToolbar } from "@/components/admin/data-toolbar";
import { DataTable, type Column } from "@/components/admin/data-table";
import { adminTickets, type AdminTicket } from "@/lib/admin-data";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const tabs = ["All", "Open", "In progress", "Resolved"];

const priorityClass: Record<string, string> = {
  High: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
  Medium: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  Low: "border-[#F5F5F5] bg-muted text-muted-foreground",
};

export default function SupportPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All");

  const rows = useMemo(
    () =>
      adminTickets.filter(
        (ticket) =>
          (tab === "All" || ticket.status === tab) &&
          (ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
            ticket.requester.toLowerCase().includes(search.toLowerCase()))
      ),
    [search, tab]
  );

  const columns: Column<AdminTicket>[] = [
    {
      key: "subject",
      header: "Subject",
      render: (ticket) => (
        <div>
          <p className="text-sm font-medium">{ticket.subject}</p>
          <p className="text-xs text-muted-foreground">{ticket.requester} · {ticket.store}</p>
        </div>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (ticket) => (
        <Badge variant="outline" className={priorityClass[ticket.priority] ?? ""}>
          {ticket.priority}
        </Badge>
      ),
    },
    { key: "status", header: "Status" },
    { key: "opened", header: "Opened" },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold">Support</h1>
        <p className="text-xs text-muted-foreground">Merchant tickets and resolution tracking</p>
      </div>

      <DataToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search subject or requester..."
        tabs={tabs}
        activeTab={tab}
        onTabChange={setTab}
        onExport={() => toast.success("Support export queued")}
      />

      <DataTable columns={columns} rows={rows} emptyMessage="No tickets match your filters" />
    </div>
  );
}
