"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";
import { SidebarRoutes } from "./sidebar-routes";
import Logo from "@/components/svgIcons/Logo";

export const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger className="md:hidden" asChild>
        <button
          type="button"
          aria-label="Open navigation"
          className="rounded-md p-2 hover:bg-slate-300/20 transition"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-[250px]">
        <SheetHeader className="border-b p-4">
          <SheetTitle>
            <Logo />
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col w-full mt-3 overflow-y-auto h-[calc(100%-72px)]">
          <SidebarRoutes />
        </div>
      </SheetContent>
    </Sheet>
  );
};
