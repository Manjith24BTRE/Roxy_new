import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Panel } from "@/components/kit/ChartCard";
import { PageHeader } from "@/components/kit/PageHeader";
import { StatCard } from "@/components/kit/StatCard";
import { StatusBadge } from "@/components/kit/StatusBadge";
import { featureFlags, relative } from "@/lib/mock/data";

export const Route = createFileRoute("/feature-flags")({
  head: () => ({
    meta: [
      { title: "Feature Flags — Veytrix Control Centre" },
      { name: "description", content: "Toggle features, control rollout percentages and target audiences per environment." },
      { property: "og:title", content: "Feature Flags — Veytrix Control Centre" },
      { property: "og:description", content: "Control Veytrix feature rollouts." },
    ],
  }),
  component: FlagsPage,
});

function FlagsPage() {
  const [state, setState] = useState(() =>
    Object.fromEntries(featureFlags.map((f) => [f.id, { enabled: f.enabled, rollout: f.rollout }])),
  );

  return (
    <>
      <PageHeader
        title="Feature Flags"
        description="Progressive delivery controls for every environment. Changes take effect within 30 seconds."
        breadcrumbs={[{ label: "System" }, { label: "Feature Flags" }]}
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Flags" value={String(featureFlags.length)} icon={Flag} />
        <StatCard label="Enabled" value={String(Object.values(state).filter((s) => s.enabled).length)} tone="success" />
        <StatCard label="Partial rollouts" value={String(featureFlags.filter((f) => f.rollout > 0 && f.rollout < 100).length)} tone="warning" />
        <StatCard label="Production flags" value={String(featureFlags.filter((f) => f.environment === "Production").length)} />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {featureFlags.map((f) => {
          const s = state[f.id]!;
          return (
            <Panel
              key={f.id}
              title={f.name}
              description={f.key}
              actions={<StatusBadge status={s.enabled ? "active" : "disabled"} label={s.enabled ? "on" : "off"} />}
              bodyClassName="flex flex-col gap-4 p-4"
            >
              <p className="text-sm text-muted-foreground">{f.description}</p>
              <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2">
                <div className="text-xs">
                  <p className="font-medium">Enabled</p>
                  <p className="text-muted-foreground">
                    {f.environment} · {f.audience}
                  </p>
                </div>
                <Switch
                  checked={s.enabled}
                  aria-label={`Toggle ${f.name}`}
                  onCheckedChange={(v) => {
                    setState((p) => ({ ...p, [f.id]: { ...p[f.id]!, enabled: v } }));
                    toast.success(`${f.key} ${v ? "enabled" : "disabled"}`);
                  }}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Rollout</span>
                  <span className="num font-medium">{s.rollout}%</span>
                </div>
                <Slider
                  value={[s.rollout]}
                  max={100}
                  step={5}
                  aria-label={`${f.name} rollout percentage`}
                  onValueChange={([v]) => setState((p) => ({ ...p, [f.id]: { ...p[f.id]!, rollout: v ?? 0 } }))}
                />
              </div>
              <p className="num text-[11px] text-muted-foreground">Updated {relative(f.updatedAt)}</p>
            </Panel>
          );
        })}
      </div>
    </>
  );
}
