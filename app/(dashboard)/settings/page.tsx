"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Check, LoaderCircle, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { LiveBadge } from "@/components/admin/live-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminStaff } from "@/lib/admin-data";
import { Skeleton } from "@/components/ui/skeleton";
const staffRoles = ["Super Admin", "Operations Admin", "Finance Admin", "Support Admin", "Viewer"];

type StaffResponse = {
  data?: AdminStaff[];
  status?: string;
};

export default function SettingsPage() {
  const [staff, setStaff] = useState<AdminStaff[]>([]);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(staffRoles[1]);

  const activeStaff = useMemo(
    () => staff.filter((member) => member.status.toLowerCase() === "active").length,
    [staff]
  );

  const invitedStaff = useMemo(
    () => staff.filter((member) => member.status.toLowerCase() === "invited").length,
    [staff]
  );

  async function loadStaff() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/staff?limit=50", { cache: "no-store" });
      if (!response.ok) throw new Error(`Staff endpoint returned ${response.status}`);

      const payload = (await response.json()) as StaffResponse;
      if (payload.status !== "success" || !Array.isArray(payload.data)) throw new Error("Unexpected staff response shape");

      setStaff(payload.data);
      setLive(true);
    } catch {
      setStaff([]);
      setLive(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStaff();
  }, []);

  async function handleAddStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const payload = { email: email.trim(), name: name.trim(), role };

    try {
      const response = await fetch("/api/admin/staff", {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) throw new Error(`Staff endpoint returned ${response.status}`);

      const body = (await response.json()) as { status?: string; data?: AdminStaff };
      if (body.status !== "success" || !body.data?.id) throw new Error("Staff creation was not confirmed");
      const created = body.data;

      setStaff((current) => [created, ...current]);
      setLive(true);
      setDialogOpen(false);
      setName("");
      setEmail("");
      setRole(staffRoles[1]);
      toast.success("Staff invite sent");
    } catch {
      toast.error("Staff endpoint is not available yet");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold">Settings</h1>
        <p className="text-xs text-muted-foreground">Platform-wide configuration and admin access controls</p>
      </div>

      <StaffAccessSection
        activeStaff={activeStaff}
        dialogOpen={dialogOpen}
        email={email}
        invitedStaff={invitedStaff}
        live={live}
        loading={loading}
        name={name}
        onAddStaff={handleAddStaff}
        onDialogOpenChange={setDialogOpen}
        onEmailChange={setEmail}
        onNameChange={setName}
        onRefresh={loadStaff}
        onRoleChange={setRole}
        role={role}
        saving={saving}
        staff={staff}
      />

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-base">Fees & monetization</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <MarkupSettingsSection />
            <div className="my-6 border-t" />
            <SubscriptionPricingSection />
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-base">Supported countries</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 pt-4">
            <p className="text-sm text-muted-foreground">Configuration unavailable.</p>
          </CardContent>
        </Card>

        <Card className="shadow-none md:col-span-2">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-base">Platform status</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 text-sm text-muted-foreground">
            Configuration unavailable.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const markupCurrencies = [
  { code: "NGN", name: "Nigerian naira", symbol: "₦" },
  { code: "GBP", name: "Pound sterling", symbol: "£" },
  { code: "KES", name: "Kenyan shilling", symbol: "KSh" },
  { code: "GHS", name: "Ghanaian cedi", symbol: "GH₵" },
  { code: "RWF", name: "Rwandan franc", symbol: "FRw" },
] as const;
const subscriptionCurrencies = markupCurrencies.filter(({ code }) => ["NGN", "KES", "GHS"].includes(code));

type MarkupSetting = {
  currency: string;
  amount: string | number;
  updated_at?: string;
} | null;

function MarkupSettingsSection() {
  const [currency, setCurrency] = useState<(typeof markupCurrencies)[number]["code"]>("NGN");
  const [amount, setAmount] = useState("");
  const [loadingMarkup, setLoadingMarkup] = useState(true);
  const [savingMarkup, setSavingMarkup] = useState(false);
  const [markupError, setMarkupError] = useState("");
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoadingMarkup(true);
    setMarkupError("");

    fetch(`/api/admin/pricing/markup?currency=${currency}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = (await response.json()) as { status?: string; message?: string; data?: MarkupSetting };
        if (!response.ok || payload.status !== "success") {
          throw new Error(payload.message || "Unable to load markup setting");
        }
        const setting = payload.data;
        setConfigured(Boolean(setting));
        setAmount(setting ? String(setting.amount) : "");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setConfigured(false);
        setMarkupError(error instanceof Error ? error.message : "Unable to load markup setting");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingMarkup(false);
      });

    return () => controller.abort();
  }, [currency]);

  async function saveMarkup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value < 0) {
      setMarkupError("Enter a valid markup amount of zero or more.");
      return;
    }

    setSavingMarkup(true);
    setMarkupError("");
    try {
      const response = await fetch("/api/admin/pricing/markup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency, amount: value }),
      });
      const payload = (await response.json()) as { status?: string; message?: string; data?: MarkupSetting };
      if (!response.ok || payload.status !== "success" || !payload.data) {
        throw new Error(payload.message || "Unable to save markup setting");
      }
      setAmount(String(payload.data.amount));
      setConfigured(true);
      toast.success(`${currency} markup updated`);
    } catch (error) {
      setMarkupError(error instanceof Error ? error.message : "Unable to save markup setting");
      toast.error("Markup setting was not saved");
    } finally {
      setSavingMarkup(false);
    }
  }

  const currencyDetails = markupCurrencies.find((item) => item.code === currency)!;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Set the additional amount charged per product unit on markup-plan stores. Vendor-listed prices stay unchanged.
      </p>
      <form onSubmit={saveMarkup} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="space-y-2">
            <Label htmlFor="markup-currency">Currency</Label>
            <Select value={currency} onValueChange={(value) => setCurrency(value as typeof currency)}>
              <SelectTrigger id="markup-currency" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {markupCurrencies.map((item) => (
                  <SelectItem key={item.code} value={item.code}>{item.code} · {item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="markup-amount">Markup per product unit</Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                {currencyDetails.symbol}
              </span>
              <Input
                id="markup-amount"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="pl-14 tabular-nums"
                placeholder="0.00"
                disabled={loadingMarkup || savingMarkup}
                required
              />
            </div>
          </div>
        </div>
        {markupError ? (
          <p role="alert" className="text-sm text-destructive">{markupError}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {loadingMarkup ? "Loading current setting…" : configured ? `Current ${currency} setting is configured.` : `No ${currency} markup has been configured yet.`}
          </p>
        )}
        <div className="flex items-center justify-between gap-3 border-t pt-4">
          <span className="text-xs text-muted-foreground">Applied once per purchased item quantity.</span>
          <Button type="submit" disabled={loadingMarkup || savingMarkup}>
            {savingMarkup ? <LoaderCircle className="size-4 animate-spin" /> : configured ? <Check className="size-4" /> : null}
            {savingMarkup ? "Saving…" : "Save markup"}
          </Button>
        </div>
      </form>
    </div>
  );
}

type SubscriptionSetting = {
  currency: string;
  monthly_amount: string | number;
  payment_ready?: boolean;
  intervals?: Record<string, { months: number; amount: number }>;
} | null;

function SubscriptionPricingSection() {
  const [currency, setCurrency] = useState<(typeof markupCurrencies)[number]["code"]>("NGN");
  const [monthlyAmount, setMonthlyAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [configured, setConfigured] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    fetch(`/api/admin/pricing/subscription?currency=${currency}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = (await response.json()) as { status?: string; message?: string; data?: SubscriptionSetting };
        if (!response.ok || payload.status !== "success") {
          throw new Error(payload.message || "Unable to load subscription price");
        }
        setConfigured(Boolean(payload.data));
        setPaymentReady(Boolean(payload.data?.payment_ready));
        setMonthlyAmount(payload.data ? String(payload.data.monthly_amount) : "");
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setConfigured(false);
        setPaymentReady(false);
        setError(reason instanceof Error ? reason.message : "Unable to load subscription price");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [currency]);

  async function saveSubscriptionPrice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(monthlyAmount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter a monthly subscription price greater than zero.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/pricing/subscription", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency, monthly_amount: value }),
      });
      const payload = (await response.json()) as { status?: string; message?: string; data?: SubscriptionSetting };
      if (!response.ok || payload.status !== "success" || !payload.data) {
        throw new Error(payload.message || "Unable to save subscription price");
      }
      setMonthlyAmount(String(payload.data.monthly_amount));
      setConfigured(true);
      setPaymentReady(Boolean(payload.data.payment_ready));
      toast.success(`${currency} subscription price updated`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save subscription price");
      toast.error("Subscription price was not saved");
    } finally {
      setSaving(false);
    }
  }

  const details = markupCurrencies.find((item) => item.code === currency)!;
  const monthly = Number(monthlyAmount);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium">Subscription price</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Set the monthly base price. Saving also creates Paystack plans for 3, 6, and 12-month automatic renewals.
        </p>
      </div>
      <form onSubmit={saveSubscriptionPrice} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="space-y-2">
            <Label htmlFor="subscription-currency">Currency</Label>
            <Select value={currency} onValueChange={(value) => setCurrency(value as typeof currency)}>
              <SelectTrigger id="subscription-currency" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {subscriptionCurrencies.map((item) => (
                  <SelectItem key={item.code} value={item.code}>{item.code} · {item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subscription-monthly-amount">Monthly price</Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">{details.symbol}</span>
              <Input
                id="subscription-monthly-amount"
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={monthlyAmount}
                onChange={(event) => setMonthlyAmount(event.target.value)}
                className="pl-14 tabular-nums"
                disabled={loading || saving}
                required
              />
            </div>
          </div>
        </div>
        {configured && Number.isFinite(monthly) && monthly > 0 && (
          <p className="text-xs text-muted-foreground tabular-nums">
            3 months: {details.symbol}{(monthly * 3).toLocaleString()} · 6 months: {details.symbol}{(monthly * 6).toLocaleString()} · 12 months: {details.symbol}{(monthly * 12).toLocaleString()}
          </p>
        )}
        {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : (
          <p className="text-xs text-muted-foreground">
            {loading
              ? "Loading current setting…"
              : !configured
                ? `No ${currency} subscription price is configured.`
                : paymentReady
                  ? `${currency} pricing and Paystack plans are ready. Saving will replace the current Paystack plans.`
                  : `${currency} price is saved, but Paystack plans need to be synchronized. Save to create matching plans.`}
          </p>
        )}
        <div className="flex items-center justify-between gap-3 border-t pt-4">
          <span className="text-xs text-muted-foreground">New prices apply to new signups; existing subscriptions keep their current plan.</span>
          <Button type="submit" disabled={loading || saving}>
            {saving ? <LoaderCircle className="size-4 animate-spin" /> : configured ? <Check className="size-4" /> : null}
            {saving ? "Saving…" : "Save subscription price"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function StaffAccessSection({
  activeStaff,
  dialogOpen,
  email,
  invitedStaff,
  live,
  loading,
  name,
  onAddStaff,
  onDialogOpenChange,
  onEmailChange,
  onNameChange,
  onRefresh,
  onRoleChange,
  role,
  saving,
  staff,
}: {
  activeStaff: number;
  dialogOpen: boolean;
  email: string;
  invitedStaff: number;
  live: boolean;
  loading: boolean;
  name: string;
  onAddStaff: (event: FormEvent<HTMLFormElement>) => void;
  onDialogOpenChange: (open: boolean) => void;
  onEmailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onRefresh: () => Promise<void>;
  onRoleChange: (value: string) => void;
  role: string;
  saving: boolean;
  staff: AdminStaff[];
}) {
  return (
    <Card className="shadow-none">
      <CardHeader className="border-b pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-base">Staff & access</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Add admin staff and review access across the dashboard.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <LiveBadge live={live} loading={loading} />
            <Button variant="outline" size="sm" onClick={() => void onRefresh()}>
              <RefreshCw className="size-4" />
              Refresh
            </Button>
            <Dialog open={dialogOpen} onOpenChange={onDialogOpenChange}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={!live || loading}>
                  <Plus className="size-4" />
                  Add staff
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add admin staff</DialogTitle>
                  <DialogDescription>Invite a teammate and assign their dashboard access level.</DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={onAddStaff}>
                  <div className="space-y-2">
                    <label className="text-xs font-medium" htmlFor="staff-name">Name</label>
                    <Input id="staff-name" value={name} onChange={(event) => onNameChange(event.target.value)} placeholder="Jane Doe" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium" htmlFor="staff-email">Email</label>
                    <Input id="staff-email" type="email" value={email} onChange={(event) => onEmailChange(event.target.value)} placeholder="jane@swiftree.app" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Role</label>
                    <Select value={role} onValueChange={onRoleChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {staffRoles.map((staffRole) => (
                          <SelectItem key={staffRole} value={staffRole}>{staffRole}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onDialogOpenChange(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? "Sending..." : "Send invite"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? <Skeleton className="m-5 h-48" aria-label="Loading staff" /> : !live ? (
          <p role="status" className="p-5 text-sm text-muted-foreground">Staff data unavailable.</p>
        ) : <>
        <div className="grid border-b text-sm sm:grid-cols-3">
          <div className="border-b px-5 py-4 sm:border-b-0 sm:border-r">
            <p className="text-xs text-muted-foreground">Staff in loaded results</p>
            <p className="mt-1 text-2xl font-bold">{staff.length}</p>
          </div>
          <div className="border-b px-5 py-4 sm:border-b-0 sm:border-r">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="mt-1 text-2xl font-bold">{activeStaff}</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-xs text-muted-foreground">Invited</p>
            <p className="mt-1 text-2xl font-bold">{invitedStaff}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b text-xs text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Staff</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Last active</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {!staff.length && <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">No staff found.</td></tr>}
              {staff.map((member) => (
                <tr key={member.id}>
                  <td className="px-5 py-4">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{member.role}</td>
                  <td className="px-5 py-4">
                    <Badge
                      variant="outline"
                      className={
                        member.status.toLowerCase() === "active"
                          ? "border-primary/20 bg-primary/10 text-primary"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                      }
                    >
                      {member.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{member.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>}
      </CardContent>
    </Card>
  );
}
