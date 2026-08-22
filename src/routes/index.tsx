import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  Layers,
  ShieldAlert,
  TrendingUp,
  UserPlus,
  Users,
  Waypoints,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ActivityTimeline } from "@/components/kit/ActivityTimeline";
import { ChartCard, Panel } from "@/components/kit/ChartCard";
import { PageHeader } from "@/components/kit/PageHeader";
import { StatCard } from "@/components/kit/StatCard";
import { StatusBadge } from "@/components/kit/StatusBadge";
import { axisProps, chartTooltip, gridProps } from "@/components/kit/chart-theme";
import {
  compact,
  fmtDateTime,
  money,
  relative,
  useControlCenterData,
} from "@/lib/control-center-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Operations Dashboard — Veytrix Control Centre" },
      {
        name: "description",
        content:
          "Live platform KPIs, revenue and AI job analytics, system health, queue status and security events for Veytrix.",
      },
      { property: "og:title", content: "Operations Dashboard — Veytrix Control Centre" },
      {
        property: "og:description",
        content: "Live platform KPIs, revenue analytics and AI operations at a glance.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const {
    activity,
    jobs,
    kpis,
    logs,
    queue,
    revenueSeries,
    services,
    transactions,
    userGrowthSeries,
    jobActivitySeries,
  } = useControlCenterData();
  const failedJobs = jobs.filter((j) => j.status === "failed").slice(0, 6);
  const securityEvents = logs.filter((l) => l.kind === "security").slice(0, 5);
  const recentTx = transactions.slice(0, 6);
  const unavailable = "No data available";

  return (
    <>
      <PageHeader
        title="Operations Dashboard"
        description="Real-time overview of platform performance, revenue, AI workloads and reliability."
        breadcrumbs={[{ label: "Dashboard" }]}
        actions={
          <>
            <Button variant="outline" size="sm">
              Last 24 hours
            </Button>
            <Button size="sm">Export report</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard
          label="Active Users"
          value={kpis ? compact(kpis.activeUsers) : "0"}
          delta={kpis?.activeUsersDelta}
          icon={Users}
        />
        <StatCard
          label="Signups"
          value={kpis ? compact(kpis.signups) : "0"}
          delta={kpis?.signupsDelta}
          icon={UserPlus}
        />
        <StatCard
          label="Revenue (MTD)"
          value={kpis ? money(kpis.revenue) : money(0)}
          delta={kpis?.revenueDelta}
          icon={CircleDollarSign}
          tone="success"
        />
        <StatCard
          label="AI Jobs"
          value={kpis ? compact(kpis.aiJobs) : "0"}
          delta={kpis?.aiJobsDelta}
          icon={Waypoints}
        />
        <StatCard
          label="Failed Jobs"
          value={kpis ? kpis.failedJobs.toLocaleString() : "0"}
          delta={kpis?.failedJobsDelta}
          invertDelta
          icon={AlertTriangle}
          tone="danger"
        />
        <StatCard
          label="Queue Depth"
          value={queue ? queue.depth.toLocaleString() : "0"}
          delta={kpis?.queueDelta}
          invertDelta
          icon={Layers}
          tone="warning"
          footer={queue ? `${queue.running} running` : "0 running"}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <ChartCard
          title="Revenue analytics"
          description="MRR, expansion and churn across the last 12 months"
          className="xl:col-span-2"
          height={280}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueSeries} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="mrrFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis {...axisProps} tickFormatter={(v) => compact(Number(v))} />
              <Tooltip {...chartTooltip} formatter={(v) => money(Number(v))} />
              <Area
                type="monotone"
                dataKey="mrr"
                name="MRR"
                stroke="var(--color-chart-1)"
                fill="url(#mrrFill)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="expansion"
                name="Expansion"
                stroke="var(--color-chart-3)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="churn"
                name="Churn"
                stroke="var(--color-destructive)"
                strokeWidth={2}
                dot={false}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="User growth"
          description="Monthly active users and new signups"
          height={280}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={userGrowthSeries} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis {...axisProps} tickFormatter={(v) => compact(Number(v))} />
              <Tooltip {...chartTooltip} />
              <Line
                type="monotone"
                dataKey="active"
                name="Active"
                stroke="var(--color-chart-2)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="signups"
                name="Signups"
                stroke="var(--color-chart-4)"
                strokeWidth={2}
                dot={false}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <ChartCard
          title="AI job activity"
          description="Completed, failed and queued jobs per hour"
          className="xl:col-span-2"
          height={260}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={jobActivitySeries} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="hour" {...axisProps} interval={3} />
              <YAxis {...axisProps} />
              <Tooltip {...chartTooltip} />
              <Bar
                dataKey="completed"
                name="Completed"
                stackId="a"
                fill="var(--color-chart-1)"
                radius={[0, 0, 0, 0]}
              />
              <Bar dataKey="queued" name="Queued" stackId="a" fill="var(--color-chart-2)" />
              <Bar
                dataKey="failed"
                name="Failed"
                stackId="a"
                fill="var(--color-destructive)"
                radius={[3, 3, 0, 0]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <Panel
          title="Queue status"
          description="Inference dispatch pipeline"
          actions={
            <Link to="/jobs" className="text-xs text-primary hover:underline">
              Open jobs
            </Link>
          }
        >
          <div className="grid grid-cols-2 gap-px bg-border">
            {[
              ["Depth", queue ? queue.depth.toLocaleString() : unavailable],
              ["Running", queue ? queue.running.toLocaleString() : unavailable],
              ["Retrying", queue ? queue.retrying.toLocaleString() : unavailable],
              ["Dead letter", queue ? queue.deadLetter.toLocaleString() : unavailable],
              ["Oldest wait", queue ? `${queue.oldestWaitSec}s` : unavailable],
              ["Throughput", queue ? `${queue.throughputPerMin}/min` : unavailable],
            ].map(([k, v]) => (
              <div key={k} className="bg-card px-4 py-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</p>
                <p className="num mt-1 text-lg font-semibold">{v}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-border px-4 py-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Healthy workers</span>
              <span className="num font-medium">
                {queue ? `${queue.workersHealthy}/${queue.workers}` : unavailable}
              </span>
            </div>
            <Progress
              value={queue ? (queue.workersHealthy / queue.workers) * 100 : 0}
              className="mt-2 h-1.5"
            />
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
        <Panel
          title="System health"
          description="Core service status"
          actions={
            <Link to="/system-health" className="text-xs text-primary hover:underline">
              Details
            </Link>
          }
        >
          <ul className="divide-y divide-border">
            {services.slice(0, 6).map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{s.name}</p>
                  <p className="num text-xs text-muted-foreground">
                    {s.responseMs}ms · {s.uptime}% uptime
                  </p>
                </div>
                <StatusBadge status={s.status} />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Recent activity" description="Across all tenants">
          <ActivityTimeline
            items={activity.slice(0, 6).map((a) => ({
              id: a.id,
              title: a.actor,
              description: `${a.action} · ${a.channel}`,
              at: relative(a.at),
              tone: "info" as const,
              icon: Activity,
            }))}
          />
        </Panel>

        <Panel
          title="Recent security events"
          description="Authentication and access signals"
          actions={
            <Link to="/audit-logs" className="text-xs text-primary hover:underline">
              Audit logs
            </Link>
          }
        >
          <ul className="divide-y divide-border">
            {securityEvents.map((e) => (
              <li key={e.id} className="flex items-start gap-3 px-4 py-2.5">
                <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{e.message}</p>
                  <p className="num truncate text-xs text-muted-foreground">
                    {e.user} · {relative(e.timestamp)}
                  </p>
                </div>
                <StatusBadge status={e.severity} dot={false} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel
          title="Failed jobs"
          description="Requires operator attention"
          actions={
            <Link to="/jobs" className="text-xs text-primary hover:underline">
              Retry queue
            </Link>
          }
        >
          <ul className="divide-y divide-border">
            {failedJobs.map((j) => (
              <li key={j.id} className="px-4 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-muted-foreground">{j.id}</span>
                  <StatusBadge status={j.status} />
                </div>
                <p className="mt-1 truncate text-sm">{j.failureReason}</p>
                <p className="num truncate text-xs text-muted-foreground">
                  {j.model} · {j.user} · {relative(j.startedAt)}
                </p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Recent transactions"
          description="Latest billing events"
          actions={
            <Link to="/transactions" className="text-xs text-primary hover:underline">
              All transactions
            </Link>
          }
        >
          <ul className="divide-y divide-border">
            {recentTx.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                  {t.status === "success" ? (
                    <CheckCircle2 className="size-3.5 text-success" />
                  ) : (
                    <TrendingUp className="size-3.5 text-muted-foreground" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.user}</p>
                  <p className="num truncate text-xs text-muted-foreground">
                    {t.plan} · {fmtDateTime(t.date).slice(0, 16)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="num text-sm font-medium">{money(t.amount)}</p>
                  <StatusBadge status={t.status} dot={false} className="mt-0.5" />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
