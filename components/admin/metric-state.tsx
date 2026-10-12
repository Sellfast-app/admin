import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RotateCw } from "lucide-react";

export function MetricState({ loading, error, empty, refresh, children }: {
  loading: boolean; error: string | null; empty: boolean; refresh: () => void; children: ReactNode;
}) {
  if (loading) return <Skeleton className="h-48 w-full rounded-md" aria-label="Loading metrics" />;
  if (error) return <div role="alert" className="flex min-h-48 flex-col items-center justify-center gap-3"><p className="text-sm text-muted-foreground">Unable to load these metrics.</p><Button variant="outline" onClick={refresh}><RotateCw size={16} />Retry</Button></div>;
  if (empty) return <p className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">No data for this period.</p>;
  return children;
}
