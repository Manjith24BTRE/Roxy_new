import { createFileRoute } from "@tanstack/react-router";
import { Boxes, GitBranch, Rocket } from "lucide-react";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartCard, Panel } from "@/components/kit/ChartCard";
import { DataTable, CellStack, Mono, type Column } from "@/components/kit/DataTable";
import { PageHeader } from "@/components/kit/PageHeader";
import { StatCard } from "@/components/kit/StatCard";
import { StatusBadge } from "@/components/kit/StatusBadge";
import { axisProps, chartColors, chartTooltip, gridProps } from "@/components/kit/chart-theme";
import { compact, jobs, models, modelMixSeries, relative } from "@/lib/mock/data";

export const Route = createFileRoute("/models")({
  head: () => ({
    meta: [
      { title: "AI Models — Veytrix Control Centre" },
      { name: "description", content: "Model catalogue, versions, throughput, error rates and failure monitoring for Veytrix inference." },
      { property: "og:title", content: "AI Models — Veytrix Control Centre" },
      { property: "og:description", content: "Manage the Veytrix model catalogue and versions." },
    ],
  }),
  component: ModelsPage,
});

type Model = (typeof models)[number];

function ModelsPage() {
  const columns: Column<Model>[] = [
    { key: "name", header: "Model", render: (m) => <CellStack primary={<Mono className="text-foreground">{m.name}</Mono>} secondary={m.family} /> },
    { key: "version", header: "Latest version", render: (m) => <Mono>{m.versions[0]}</Mono>, hideBelow: "md" },
    { key: "status", header: "Status", render: (m) => <StatusBadge status={m.status} /> },
    { key: "latency", header: "p95 latency", render: (m) => <span className="num">{m.latencyMs} ms</span>, hideBelow: "lg" },
    { key: "jobs", header: "Jobs (24h)", render: (m) => <span className="num">{m.jobs24h.toLocaleString()}</span>, hideBelow: "md" },
    {
      key: "err",
      header: "Error rate",
      render: (m) => <span className={m.errorRate > 2 ? "num text-destructive" : "num"}>{m.errorRate}%</span>,
    },
    { key: "cost", header: "Cost / 1k", render: (m) => <span className="num">${m.costPer1k}</span>, hideBelow: "xl" },
  ];

  const failures = jobs.filter((j) => j.failureReason).slice(0, 8);

  return (
    <>
      <PageHeader
        title="AI Models"
        description="Catalogue, versions, throughput and reliability of every deployed model."
        breadcrumbs={[{ label: "Models" }]}
        actions={
          <Button size="sm" onClick={() => toast.success("Deployment queued", { description: "veytrix-text-4.2.2 rolling out at 10%." })}>
            <Rocket className="size-3.5" /> Deploy version
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Models" value={String(models.length)} icon={Boxes} />
        <StatCard label="Versions live" value={String(models.reduce((a, m) => a + m.versions.length, 0))} icon={GitBranch} />
        <StatCard label="Jobs (24h)" value={compact(models.reduce((a, m) => a + m.jobs24h, 0))} delta={9.4} />
        <StatCard label="Weighted error rate" value="0.9%" delta={-12.1} invertDelta tone="success" />
      </div>

      <Tabs defaultValue="catalogue" className="space-y-3">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="catalogue">Catalogue</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="failures">Failure monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="catalogue" className="m-0">
          <DataTable columns={columns} rows={models} pageSize={10} emptyTitle="No models" />
        </TabsContent>

        <TabsContent value="versions" className="m-0 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {models.map((m) => (
            <Panel key={m.id} title={m.name} description={`${m.family} · ${m.versions.length} versions`}>
              <ul className="divide-y divide-border">
                {m.versions.map((v, i) => (
                  <li key={v} className="flex items-center justify-between px-4 py-2.5">
                    <Mono className="text-foreground">v{v}</Mono>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={i === 0 ? "active" : "archived"} label={i === 0 ? "primary" : "retired"} />
                      <span className="num text-xs text-muted-foreground">{i === 0 ? "100%" : "0%"} traffic</span>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
        </TabsContent>

        <TabsContent value="analytics" className="m-0 grid grid-cols-1 gap-3 xl:grid-cols-3">
          <ChartCard title="Job mix by model" description="Share of 24h executions" height={280}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={modelMixSeries} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {modelMixSeries.map((_, i) => (
                    <Cell key={i} fill={chartColors[i % chartColors.length]} stroke="var(--color-card)" />
                  ))}
                </Pie>
                <Tooltip {...chartTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Latency by model" description="p95 in milliseconds" className="xl:col-span-2" height={280}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={models} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="name" {...axisProps} interval={0} tick={{ fontSize: 10 }} />
                <YAxis {...axisProps} unit="ms" />
                <Tooltip {...chartTooltip} />
                <Bar dataKey="latencyMs" name="p95" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="failures" className="m-0">
          <Panel title="Recent failures" description="Grouped by root cause">
            <ul className="divide-y divide-border">
              {failures.map((f) => (
                <li key={f.id} className="flex items-start justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{f.failureReason}</p>
                    <p className="num truncate text-xs text-muted-foreground">
                      {f.model} · {f.id} · {relative(f.startedAt)}
                    </p>
                  </div>
                  <StatusBadge status={f.status} />
                </li>
              ))}
            </ul>
          </Panel>
        </TabsContent>
      </Tabs>
    </>
  );
}
