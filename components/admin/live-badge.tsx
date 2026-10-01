import { Badge } from "@/components/ui/badge";

export function LiveBadge({ live, loading }: { live: boolean; loading?: boolean }) {
  if (loading) {
    return (
      <Badge variant="outline" className="border-muted bg-muted text-muted-foreground">
        Syncing…
      </Badge>
    );
  }
  return live ? (
    <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
      <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
      Live
    </Badge>
  ) : (
    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
      Sample data
    </Badge>
  );
}
