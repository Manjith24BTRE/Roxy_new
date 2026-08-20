import { createFileRoute } from "@tanstack/react-router";
import { Activity, Clock, RefreshCw, ServerCog, ShieldCheck, Timer } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChartCard, Panel } from "@/components/kit/ChartCard";
import { PageHeader } from "@/components/kit/PageHeader";
import { StatCard } from "@/components/kit/StatCard";
import { StatusBadge } from "@/components/kit/StatusBadge";
import { axisProps, chartTooltip, gridProps } from "@/components/kit/chart-theme";
import { ActivityTimeline } from "@/components/kit/ActivityTimeline";
import { fmtDateTime, incidents, latencySeries, relative, services } from "@/lib/mock/data";

export const Route = createFileRoute("/system-health")({
  head: () => ({
    meta: [
      { title: "System Health — Veytrix Control Centre" },
      {
        name: "description",
        content:
          "Live status, response times, uptime and incident history for every Veytrix platform service.",
      },
      { property: "og:title", content: "System Health — Veytrix Control Centre" },
      { property: "og:description", content: "Service status, uptime and incident history." },
    ],
  }),
  component: SystemHealth,
});

function SystemHealth() {
  const operational = services.filter((s) => s.status === "operational").length;
  const avgLatency = Math.round(
    services.reduce((a, s) => a + s.responseMs, 0) / services.length,
  );
  const avgUptime = (services.reduce((a, s) => a + s.uptime, 0) / services.length).toFixed(2);

  return (
    <>
      <PageHeader
        title="System Health"
        description="Availability, latency and incident posture across every platform dependency."
        breadcrumbs={[{ label: "System Health" }]}
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.success("Health probes re-run", { description: "All 8 services re-checked." })}
          >
            <RefreshCw className="size-3.5" /> Re-run checks
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Services operational" value={`${operational}/${services.length}`} icon={ServerCog} tone="success" footer="2 degraded · 1 maintenance" />
        <StatCard label="Avg response time" value={`${avgLatency} ms`} delta={-6.4} invertDelta icon={Timer} />
        <StatCard label="30-day uptime" value={`${avgUptime}%`} delta={0.03} icon={ShieldCheck} tone="success" />
        <StatCard label="Open incidents" value="3" delta={50} invertDelta icon={Activity} tone="warning" />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-4">
        {services.map((s) => (
          <article key={s.id} className="panel p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold">{s.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {s.category} · {s.region}
                </p>
              </div>
              <StatusBadge status={s.status} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-y-2 text-xs">
              <dt className="text-muted-foreground">Response</dt>
              <dd className="num text-right font-medium">{s.responseMs ? `${s.responseMs} ms` : "—"}</dd>
              <dt className="text-muted-foreground">Uptime (30d)</dt>
              <dd className="num text-right font-medium">{s.uptime}%</dd>
              <dt className="text-muted-foreground">Incidents (90d)</dt>
              <dd className="num text-right font-medium">{s.incidents}</dd>
            </dl>
            <Progress value={s.uptime} className="mt-3 h-1.5" />
            <p className="num mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="size-3" /> Checked {relative(s.lastChecked)}
            </p>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <ChartCard
          title="API latency percentiles"
          description="p50 / p95 / p99 over the last 24 hours"
          className="xl:col-span-2"
          height={280}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={latencySeries} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="hour" {...axisProps} interval={3} />
              <YAxis {...axisProps} unit="ms" />
              <Tooltip {...chartTooltip} />
              <Line type="monotone" dataKey="p50" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="p95" stroke="var(--color-chart-4)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="p99" stroke="var(--color-destructive)" strokeWidth={2} dot={false} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <Panel title="Recent incidents" description="Last 90 days">
          <ActivityTimeline
            items={incidents.map((i) => ({
              id: i.id,
              title: i.title,
              description: `${i.service} · ${i.impact}${i.resolvedAt ? " · Resolved" : " · Ongoing"}`,
              at: fmtDateTime(i.startedAt).slice(5, 16),
              tone:
                i.severity === "critical" ? ("danger" as const) : i.severity === "warning" ? ("warning" as const) : ("info" as const),
            }))}
          />
        </Panel>
      </div>
    </>
  );
}
