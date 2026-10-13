"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { adminStaff, type AdminStaff } from "@/lib/admin-data";

const platformFees = [
  { label: "Retail & Wholesale transaction fee", value: "3%" },
  { label: "Food & Restaurant transaction fee", value: "5%" },
  { label: "Ticketing transaction fee", value: "5%" },
  { label: "Product markup (markup model)", value: "₦500" },
];

const countries = ["Nigeria", "United Kingdom", "Kenya", "Ghana", "Rwanda"];
const staffRoles = ["Super Admin", "Operations Admin", "Finance Admin", "Support Admin", "Viewer"];

type StaffResponse = {
  data?: AdminStaff[];
  status?: string;
};

export default function SettingsPage() {
  const [staff, setStaff] = useState<AdminStaff[]>(adminStaff);
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
      if (!Array.isArray(payload.data)) throw new Error("Unexpected staff response shape");

      setStaff(payload.data);
      setLive(true);
    } catch {
      setStaff(adminStaff);
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

      const body = (await response.json()) as { data?: AdminStaff };
      const created =
        body.data ??
        ({
          id: `staff-${Date.now()}`,
          lastActive: "Pending",
          status: "Invited",
          ...payload,
        } satisfies AdminStaff);

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
          <CardContent className="divide-y p-0">
            {platformFees.map((fee) => (
              <div key={fee.label} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="text-muted-foreground">{fee.label}</span>
                <span className="font-semibold">{fee.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-base">Supported countries</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 pt-4">
            {countries.map((country) => (
              <Badge key={country} variant="secondary">{country}</Badge>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-none md:col-span-2">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-base">Platform status</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-0 divide-y p-0 md:grid-cols-2 md:divide-x md:divide-y-0">
            <div className="flex items-center justify-between px-5 py-4 text-sm">
              <div>
                <p>New merchant signups</p>
                <p className="text-xs text-muted-foreground">Allow vendor registration</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between px-5 py-4 text-sm">
              <div>
                <p>Maintenance mode</p>
                <p className="text-xs text-muted-foreground">Show maintenance banner on all storefronts</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
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
                <Button size="sm">
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
        <div className="grid border-b text-sm sm:grid-cols-3">
          <div className="border-b px-5 py-4 sm:border-b-0 sm:border-r">
            <p className="text-xs text-muted-foreground">Total staff</p>
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
      </CardContent>
    </Card>
  );
}
