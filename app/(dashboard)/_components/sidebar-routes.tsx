"use client";

import { SidebarItem } from "./sidebar-item";
import {
  Banknote,
  Bike,
  LayoutDashboardIcon,
  LifeBuoy,
  ReceiptText,
  Settings,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";

interface Route {
  icon: React.FC<React.SVGProps<SVGSVGElement> & { color?: string }>;
  label: string;
  href?: string;
  onClick?: () => Promise<void> | void;
}

const adminRoutes: Route[] = [
  { icon: LayoutDashboardIcon, label: "Overview", href: "/overview" },
  { icon: Users, label: "Users", href: "/users" },
  { icon: ShoppingBag, label: "Orders", href: "/orders" },
  { icon: ReceiptText, label: "Transactions", href: "/transactions" },
  { icon: Bike, label: "Deliveries", href: "/deliveries" },
  { icon: Banknote, label: "Finance", href: "/finance" },
  { icon: Wallet, label: "Subscriptions", href: "/subscriptions" },
  { icon: LifeBuoy, label: "Support", href: "/support" },
];

const actionRoutes: Route[] = [
  { icon: Settings, label: "Settings", href: "/settings" },
];

export const SidebarRoutes = () => {
  return (
    <div className="flex flex-col w-full">
      {adminRoutes.map((route) => (
        <SidebarItem
          key={route.href}
          icon={route.icon}
          label={route.label}
          href={route.href}
        />
      ))}
      <div className="mt-auto w-full pb-6">
        <div className="w-full border-b border-[#F5F5F5] dark:border-[#1F1F1F]">
          {actionRoutes.map((route) => (
            <SidebarItem
              key={route.label}
              icon={route.icon}
              label={route.label}
              href={route.href}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
