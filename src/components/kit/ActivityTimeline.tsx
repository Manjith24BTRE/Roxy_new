import type { LucideIcon } from "lucide-react";
import { Dot } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  at: string;
  tone?: "default" | "success" | "warning" | "danger" | "info";
  icon?: LucideIcon;
}

const TONE: Record<string, string> = {
  default: "border-border bg-muted text-muted-foreground",
  success: "border-success/30 bg-success/12 text-success",
  warning: "border-warning/30 bg-warning/12 text-warning",
  danger: "border-destructive/30 bg-destructive/12 text-destructive",
  info: "border-info/30 bg-info/12 text-info",
};

export function ActivityTimeline({
  items,
  className,
}: {
  items: TimelineItem[];
  className?: string;
}) {
  return (
    <ol className={cn("relative space-y-4 px-4 py-4", className)}>
      <span className="absolute left-[27px] top-6 bottom-6 w-px bg-border" aria-hidden />
      {items.map((item) => {
        const Icon = item.icon ?? Dot;
        return (
          <li key={item.id} className="relative flex gap-3">
            <span
              className={cn(
                "z-10 flex size-6 shrink-0 items-center justify-center rounded-full border",
                TONE[item.tone ?? "default"],
              )}
            >
              <Icon className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <span className="num shrink-0 text-xs text-muted-foreground">{item.at}</span>
              </div>
              {item.description && (
                <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
