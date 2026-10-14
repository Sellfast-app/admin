"use client";

import { useMemo, useState } from "react";
import { DataToolbar } from "@/components/admin/data-toolbar";
import { DataTable, type Column } from "@/components/admin/data-table";
import { LiveBadge } from "@/components/admin/live-badge";
import type { AdminCoupon } from "@/lib/admin-data";
import { useAdminList, type AdminCouponRow } from "@/lib/admin-client";
import { MetricState } from "@/components/admin/metric-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Hash, Store, Copy } from "lucide-react";
import { toast } from "sonner";

const tabs = ["All", "Active", "Expired"];

interface CreateCouponForm {
  code: string;
  amount: string;
  store_name: string;
  startDate: string;
  expiryDate: string;
  usageLimit: string;
}

type CouponRow = AdminCoupon & { id: string };

export default function CouponsPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const state = useAdminList<AdminCouponRow>("coupons", { search }, { limit: 50 });
  const { rows, live, loading } = useMemo(
    () => ({ rows: state.rows ?? [], live: state.live, loading: state.loading }),
    [state.rows, state.live, state.loading]
  );

  // Rows from the API don't have an `id`; derive one from the coupon code for the table key.
  const couponRows: CouponRow[] = useMemo(
    () => rows.map((c) => ({ ...c, id: c.code })),
    [rows]
  );

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState<CreateCouponForm>({
    code: "",
    amount: "",
    store_name: "",
    startDate: today,
    expiryDate: today,
    usageLimit: "100",
  });

  const handleInputChange = (field: keyof CreateCouponForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const filtered: CouponRow[] = useMemo(() => {
    const now = new Date();
    return couponRows.filter((c) => {
      const matchesSearch =
        !search ||
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.store_name.toLowerCase().includes(search.toLowerCase());
      if (tab === "All") return matchesSearch;
      if (tab === "Active") return matchesSearch && new Date(c.expiryDate) > now;
      if (tab === "Expired") return matchesSearch && new Date(c.expiryDate) <= now;
      return matchesSearch;
    });
  }, [couponRows, search, tab]);

  const columns: Column<CouponRow>[] = [
    {
      key: "code",
      header: "Code",
      render: (coupon) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium">{coupon.code}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={() => {
              navigator.clipboard.writeText(coupon.code);
              toast.success("Copied", { description: `${coupon.code} copied to clipboard` });
            }}
            aria-label={`Copy ${coupon.code}`}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
    {
      key: "store_name",
      header: "Store",
      render: (coupon) => (
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-muted-foreground" />
          {coupon.store_name || "—"}
        </div>
      ),
    },
    {
      key: "startDate",
      header: "Start date",
      render: (coupon) => formatDate(coupon.startDate),
    },
    {
      key: "expiryDate",
      header: "Expiry",
      render: (coupon) => {
        const isExpired = new Date(coupon.expiryDate) <= new Date();
        return (
          <span className={isExpired ? "text-destructive" : ""}>
            {formatDate(coupon.expiryDate)}
          </span>
        );
      },
    },
    {
      key: "usageLimit",
      header: "Usage limit",
      render: (coupon) => (
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <span>{coupon.usageLimit}</span>
        </div>
      ),
    },
  ];

  const handleCreate = async () => {
    if (!form.code.trim() || !form.amount) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/coupons/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.trim().toUpperCase(),
          amount: Number(form.amount) || 0,
          startDate: form.startDate,
          expiryDate: form.expiryDate,
          usageLimit: Number(form.usageLimit) || 0,
        }),
      });
      const body = await res.json();
      if (!res.ok || body.status !== "success") {
        throw new Error(body.message || "Failed to create coupon");
      }
      toast.success("Coupon created", { description: `${form.code.toUpperCase()} has been created` });
      setIsCreateOpen(false);
      setForm({
        code: "",
        amount: "",
        store_name: "",
        startDate: today,
        expiryDate: today,
        usageLimit: "100",
      });
      state.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create coupon";
      toast.error("Error", { description: msg });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Coupons</h1>
          <p className="text-xs text-muted-foreground">
            {live && !loading
              ? `${filtered.length} coupons${search ? " matching your search" : " on this page"}`
              : "Food vendor promotional coupons"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LiveBadge live={live} loading={loading} />
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="default">
                <Plus className="h-4 w-4 mr-1" />
                Create coupon
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create coupon</DialogTitle>
                <DialogDescription>
                  Add a promotional coupon for a food vendor store.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1">
                  <Label htmlFor="code">Coupon code</Label>
                  <Input
                    id="code"
                    placeholder="e.g. FREESHIP39"
                    value={form.code}
                    onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())}
                    maxLength={16}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="amount">Discount amount (₦)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => handleInputChange("amount", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="store_name">Store name</Label>
                  <Input
                    id="store_name"
                    placeholder="e.g. Chigozie Kitchen"
                    value={form.store_name}
                    onChange={(e) => handleInputChange("store_name", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="startDate">Start date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={form.startDate}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="expiryDate">Expiry date</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={form.expiryDate}
                      onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="usageLimit">Usage limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    placeholder="100"
                    value={form.usageLimit}
                    onChange={(e) => handleInputChange("usageLimit", e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreate}
                  disabled={isCreating || !form.code.trim() || !form.amount}
                >
                  {isCreating ? "Creating…" : "Create coupon"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DataToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search code or store..."
        tabs={tabs}
        activeTab={tab}
        onTabChange={setTab}
        showExport={false}
      />

      <MetricState loading={loading} error={state.error} refresh={state.refresh} empty={false}>
        <DataTable
          columns={columns}
          rows={filtered}
          emptyMessage="No coupons match your filters"
        />
      </MetricState>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
