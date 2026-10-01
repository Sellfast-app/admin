import { Button } from "@/components/ui/button";
import { MobileSidebar } from "./Mobile-sidebar";

export const Navbar = () => {
  return (
    <header className="h-[80px] w-full bg-card border-b border-[#F5F5F5] dark:border-[#1F1F1F]">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="md:hidden">
            <MobileSidebar />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">Swiftree Admin</p>
            <p className="text-xs text-muted-foreground">Platform operations console</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
            Super Admin
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => (window.location.href = "/")}
            className="dark:bg-background"
          >
            <span className="hidden sm:inline">View Platform</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
