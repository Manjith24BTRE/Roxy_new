import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  deltaLabel = "vs last period",
  icon: Icon,
  invertDelta = false,
  footer,
  tone = "default",
}: {
  label: string;
  value: string;
  delta?: number;
  deltaLabel?: string;
  icon?: LucideIcon;
  invertDelta?: boolean;
  footer?: React.ReactNode;
  tone?: "default" | "danger" | "warning" | "success";
}) {
  const positive = delta !== undefined && delta > 0;
  const good = delta === undefined ? true : invertDelta ? !positive : positive;
  const DeltaIcon = delta === undefined || delta === 0 ? Minus : positive ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="panel relative overflow-hidden p-4">
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-px",
          tone === "danger" && "bg-destructive/60",
          tone === "warning" && "bg-warning/60",
          tone === "success" && "bg-success/60",
          tone === "default" && "bg-primary/40",
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" />}
      </div>
      <p className="num mt-2.5 text-2xl font-semibold tracking-tight">{value}</p>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {delta !== undefined && (
          <span
            className={cn(
              "num inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium",
              good ? "bg-success/12 text-success" : "bg-destructive/12 text-destructive",
            )}
          >
            <DeltaIcon className="size-3" />
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
        <span className="truncate text-muted-foreground">{footer ?? deltaLabel}</span>
      </div>
    </div>
  );
}
