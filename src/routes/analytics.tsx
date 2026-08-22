import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3, Download, TrendingUp, Users, Zap } from "lucide-react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartCard, Panel } from "@/components/kit/ChartCard";
import { PageHeader } from "@/components/kit/PageHeader";
import { StatCard } from "@/components/kit/StatCard";
import { axisProps, chartColors, chartTooltip, gridProps } from "@/components/kit/chart-theme";
import { compact, money, useControlCenterData } from "@/lib/control-center-data";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Veytrix Control Centre" },
      {
        name: "description",
        content:
          "Growth, revenue, AI consumption and performance analytics for the Veytrix platform.",
      },
      { property: "og:title", content: "Analytics — Veytrix Control Centre" },
      { property: "og:description", content: "Cross-platform analytics and reporting." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const {
    creditsSeries,
    jobActivitySeries,
    kpis,
    latencySeries,
    modelMixSeries,
    revenueSeries,
    userGrowthSeries,
  } = useControlCenterData();
  const [range, setRange] = useState("12m");

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Cross-cutting view of growth, monetisation and AI workload efficiency."
        breadcrumbs={[{ label: "Analytics" }]}
        actions={
          <>
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  ["7d", "Last 7 days"],
                  ["30d", "Last 30 days"],
                  ["12m", "Last 12 months"],
                ].map(([v, l]) => (
                  <SelectItem key={v} value={v!} className="text-xs">
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.success("Report export queued")}
            >
              <Download className="size-3.5" /> Export
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="Active users"
          value={kpis ? compact(kpis.activeUsers) : "No data available"}
          delta={kpis?.activeUsersDelta}
          icon={Users}
        />
        <StatCard
          label="Net MRR"
          value={kpis ? money(kpis.revenue) : "No data available"}
          delta={kpis?.revenueDelta}
          icon={TrendingUp}
          tone="success"
        />
        <StatCard
          label="AI jobs"
          value={kpis ? compact(kpis.aiJobs) : "No data available"}
          delta={kpis?.aiJobsDelta}
          icon={Zap}
        />
        <StatCard label="Credit burn rate" value="No data available" icon={BarChart3} />
      </div>

      <Tabs defaultValue="growth" className="space-y-3">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="ai">AI usage</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="growth" className="m-0 grid grid-cols-1 gap-3 xl:grid-cols-3">
          <ChartCard
            title="Active users"
            description="Monthly actives vs new signups"
            className="xl:col-span-2"
            height={300}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={userGrowthSeries}
                margin={{ top: 6, right: 8, left: -14, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="month" {...axisProps} />
                <YAxis {...axisProps} />
                <Tooltip {...chartTooltip} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area
                  type="monotone"
                  dataKey="active"
                  name="Active"
                  stroke="var(--color-chart-1)"
                  fill="url(#gActive)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="signups"
                  name="Signups"
                  stroke="var(--color-chart-2)"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
          <Panel
            title="Cohort retention"
            description="Rolling 6-month"
            bodyClassName="p-4 space-y-3"
          >
            {[
              ["Month 1", 92],
              ["Month 2", 81],
              ["Month 3", 74],
              ["Month 4", 69],
              ["Month 5", 65],
              ["Month 6", 62],
            ].map(([m, v]) => (
              <div key={String(m)} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{m}</span>
                  <span className="num">{v}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${v}%` }} />
                </div>
              </div>
            ))}
          </Panel>
        </TabsContent>

        <TabsContent value="revenue" className="m-0 grid grid-cols-1 gap-3 xl:grid-cols-3">
          <ChartCard
            title="MRR composition"
            description="New, expansion and churned revenue"
            className="xl:col-span-2"
            height={300}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueSeries} margin={{ top: 6, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="month" {...axisProps} />
                <YAxis {...axisProps} tickFormatter={(v) => compact(Number(v))} />
                <Tooltip {...chartTooltip} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey="mrr"
                  name="MRR"
                  stackId="a"
                  fill="var(--color-chart-1)"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="expansion"
                  name="Expansion"
                  stackId="a"
                  fill="var(--color-chart-2)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Revenue by plan" height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Starter", value: 139780 },
                    { name: "Growth", value: 211860 },
                    { name: "Scale", value: 243390 },
                    { name: "Enterprise", value: 125160 },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={88}
                  paddingAngle={2}
                >
                  {chartColors.slice(0, 4).map((c, i) => (
                    <Cell key={i} fill={c} stroke="var(--color-card)" />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip {...chartTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="ai" className="m-0 grid grid-cols-1 gap-3 xl:grid-cols-3">
          <ChartCard title="Credits purchased vs consumed" className="xl:col-span-2" height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={creditsSeries} margin={{ top: 6, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="month" {...axisProps} />
                <YAxis {...axisProps} tickFormatter={(v) => compact(Number(v))} />
                <Tooltip {...chartTooltip} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="purchased"
                  name="Purchased"
                  stroke="var(--color-chart-2)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="consumed"
                  name="Consumed"
                  stroke="var(--color-chart-4)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Job mix by model" height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={modelMixSeries}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={88}
                  paddingAngle={2}
                >
                  {modelMixSeries.map((_, i) => (
                    <Cell
                      key={i}
                      fill={chartColors[i % chartColors.length]}
                      stroke="var(--color-card)"
                    />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip {...chartTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="performance" className="m-0 grid grid-cols-1 gap-3 xl:grid-cols-2">
          <ChartCard title="Latency percentiles" description="Last 24 hours" height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={latencySeries} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="hour" {...axisProps} interval={3} />
                <YAxis {...axisProps} unit="ms" />
                <Tooltip {...chartTooltip} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="p50"
                  stroke="var(--color-chart-2)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="p95"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="p99"
                  stroke="var(--color-chart-5)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Job throughput" description="Completed vs failed per hour" height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={jobActivitySeries}
                margin={{ top: 6, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="hour" {...axisProps} interval={3} />
                <YAxis {...axisProps} />
                <Tooltip {...chartTooltip} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="completed" stackId="j" fill="var(--color-chart-2)" />
                <Bar
                  dataKey="failed"
                  stackId="j"
                  fill="var(--color-destructive)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>
      </Tabs>
    </>
  );
}
