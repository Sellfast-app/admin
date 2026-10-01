"use client";

import { Sidebar } from "../_components/sidebar";
import { Navbar } from "../_components/navbar";
import { MobileSidebar } from "../_components/Mobile-sidebar";

export const AdminShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full">
      <div className="h-[80px] md:pl-[250px] fixed inset-y-0 w-full z-50">
        <Navbar />
      </div>
      <div className="hidden md:flex h-full w-[250px] flex-col fixed inset-y-0 z-45">
        <Sidebar />
      </div>
      <MobileSidebar />
      <main className="md:pl-[250px] pt-[80px] h-full bg-[#FCFCFC] dark:bg-background">
        {children}
      </main>
    </div>
  );
};
