import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const platformFees = [
  { label: "Retail & Wholesale transaction fee", value: "3%" },
  { label: "Food & Restaurant transaction fee", value: "5%" },
  { label: "Ticketing transaction fee", value: "5%" },
  { label: "Product markup (markup model)", value: "₦500" },
];

const countries = ["Nigeria", "United Kingdom", "Kenya", "Ghana", "Rwanda"];

export default function SettingsPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold">Settings</h1>
        <p className="text-xs text-muted-foreground">Platform-wide configuration (read-only until backend support ships)</p>
      </div>

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

        <Card className="shadow-none">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-base">Platform status</CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            <div className="flex items-center justify-between px-5 py-3 text-sm">
              <div>
                <p>New merchant signups</p>
                <p className="text-xs text-muted-foreground">Allow vendor registration</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between px-5 py-3 text-sm">
              <div>
                <p>Maintenance mode</p>
                <p className="text-xs text-muted-foreground">Show maintenance banner on all storefronts</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-base">Staff & access</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">
              Admin role management and audit logging will be wired to the RBAC and audit ledger endpoints.
            </p>
            <Button variant="outline" size="sm" className="mt-3" disabled>
              Manage admin roles
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
