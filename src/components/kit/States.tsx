import { AlertTriangle, Inbox, Loader2, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function EmptyState({
  title = "Nothing to show",
  description = "There are no records matching the current filters.",
  icon: Icon = Inbox,
  action,
  className,
}: {
  title?: string;
  description?: string;
  icon?: typeof Inbox;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center px-6 py-14 text-center", className)}
    >
      <div className="mb-3 flex size-10 items-center justify-center rounded-lg border border-border bg-muted">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingState({ rows = 6, label }: { rows?: number; label?: string }) {
  return (
    <div className="space-y-2 p-4" aria-busy="true">
      {label && (
        <p className="flex items-center gap-2 pb-2 text-sm text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" /> {label}
        </p>
      )}
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-full rounded-md" />
      ))}
    </div>
  );
}

export function ErrorState({
  title = "Could not load data",
  description = "The upstream service did not respond in time. Retry or check System Health.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-3 flex size-10 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10">
        <AlertTriangle className="size-5 text-destructive" />
      </div>
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          <RefreshCw className="size-3.5" /> Retry
        </Button>
      )}
    </div>
  );
}
