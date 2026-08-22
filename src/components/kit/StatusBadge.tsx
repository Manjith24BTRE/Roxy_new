import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "primary";

const TONES: Record<string, Tone> = {
  operational: "success",
  active: "success",
  completed: "success",
  resolved: "success",
  success: "success",
  published: "success",
  enabled: "success",
  healthy: "success",

  degraded: "warning",
  warning: "warning",
  pending: "warning",
  waiting: "warning",
  retrying: "warning",
  maintenance: "warning",
  scheduled: "warning",
  in_progress: "warning",
  suspended: "warning",

  down: "danger",
  failed: "danger",
  error: "danger",
  critical: "danger",
  banned: "danger",
  urgent: "danger",

  running: "info",
  queued: "info",
  open: "info",
  assigned: "info",
  info: "info",
  refunded: "info",
  high: "info",

  closed: "neutral",
  cancelled: "neutral",
  archived: "neutral",
  disabled: "neutral",
  draft: "neutral",
  debug: "neutral",
  low: "neutral",
  medium: "neutral",
};

const TONE_CLASS: Record<Tone, string> = {
  success: "border-success/30 bg-success/12 text-success",
  warning: "border-warning/30 bg-warning/12 text-warning",
  danger: "border-destructive/35 bg-destructive/12 text-destructive",
  info: "border-info/35 bg-info/12 text-info",
  neutral: "border-border bg-muted text-muted-foreground",
  primary: "border-primary/35 bg-primary/12 text-primary",
};

const PULSE: Tone[] = ["success", "info"];

export function StatusBadge({
  status,
  label,
  dot = true,
  className,
}: {
  status: string;
  label?: string;
  dot?: boolean;
  className?: string;
}) {
  const tone = TONES[status] ?? "neutral";
  const text = label ?? status.replace(/_/g, " ");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-[11px] font-medium capitalize leading-5 tracking-tight",
        TONE_CLASS[tone],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            "size-1.5 rounded-full bg-current",
            PULSE.includes(tone) && status === "running" && "animate-pulse",
          )}
        />
      )}
      {text}
    </span>
  );
}

export function SeverityDot({ severity }: { severity: string }) {
  const tone = TONES[severity] ?? "neutral";
  return (
    <span className={cn("inline-block size-2 rounded-full", TONE_CLASS[tone], "bg-current")} />
  );
}
