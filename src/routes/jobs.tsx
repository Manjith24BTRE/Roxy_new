import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Ban, ListRestart, RotateCcw, Waypoints } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityTimeline } from "@/components/kit/ActivityTimeline";
import { ConfirmationDialog } from "@/components/kit/ConfirmDialog";
import { DataTable, CellStack, Mono, type Column } from "@/components/kit/DataTable";
import { FilterBar } from "@/components/kit/FilterBar";
import { PageHeader } from "@/components/kit/PageHeader";
import { StatCard } from "@/components/kit/StatCard";
import { StatusBadge } from "@/components/kit/StatusBadge";
import { fmtDateTime, jobs, models, relative, type Job } from "@/lib/mock/data";

export const Route = createFileRoute("/jobs")({
  head: () => ({
    meta: [
      { title: "AI Jobs — Veytrix Control Centre" },
      {
        name: "description",
        content:
          "Inspect, retry and cancel AI inference jobs across models, versions and regions with full failure detail.",
      },
      { property: "og:title", content: "AI Jobs — Veytrix Control Centre" },
      { property: "og:description", content: "Operate the Veytrix inference job pipeline." },
    ],
  }),
  component: JobsPage,
});

function JobsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [model, setModel] = useState("all");
  const [tab, setTab] = useState("all");
  const [detail, setDetail] = useState<Job | null>(null);
  const [confirm, setConfirm] = useState<{ job: Job; action: "retry" | "cancel" } | null>(null);

  const rows = useMemo(
    () =>
      jobs.filter((j) => {
        const q = search.toLowerCase();
        const match = !q || [j.id, j.user, j.model, j.region].some((f) => f.toLowerCase().includes(q));
        const tabMatch =
          tab === "all" ||
          (tab === "retry" && (j.status === "failed" || j.status === "retrying")) ||
          (tab === "active" && (j.status === "running" || j.status === "queued"));
        return (
          match && tabMatch && (status === "all" || j.status === status) && (model === "all" || j.model === model)
        );
      }),
    [search, status, model, tab],
  );

  const columns: Column<Job>[] = [
    { key: "id", header: "Job ID", render: (j) => <Mono className="text-foreground">{j.id}</Mono> },
    { key: "user", header: "User", render: (j) => <CellStack primary={j.user} secondary={j.userId} />, hideBelow: "lg" },
    { key: "model", header: "Model", render: (j) => <CellStack primary={j.model} secondary={`v${j.version}`} />, hideBelow: "md" },
    { key: "status", header: "Status", render: (j) => <StatusBadge status={j.status} /> },
    { key: "tokens", header: "Tokens", render: (j) => <span className="num">{j.tokens.toLocaleString()}</span>, hideBelow: "xl" },
    { key: "credits", header: "Credits", render: (j) => <span className="num">{j.credits}</span>, hideBelow: "xl" },
    { key: "started", header: "Started", render: (j) => <span className="num text-xs">{relative(j.startedAt)}</span>, hideBelow: "md" },
    {
      key: "duration",
      header: "Duration",
      render: (j) => <span className="num text-xs">{(j.durationMs / 1000).toFixed(1)}s</span>,
      hideBelow: "lg",
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      headerClassName: "text-right",
      render: (j) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2"
            disabled={j.status === "completed"}
            onClick={() => setConfirm({ job: j, action: "retry" })}
          >
            <RotateCcw className="size-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2"
            disabled={j.status !== "running" && j.status !== "queued"}
            onClick={() => setConfirm({ job: j, action: "cancel" })}
          >
            <Ban className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const failed = jobs.filter((j) => j.status === "failed").length;

  return (
    <>
      <PageHeader
        title="AI Jobs"
        description="Every inference execution with tokens, credits, duration and failure diagnostics."
        breadcrumbs={[{ label: "Jobs" }]}
        actions={
          <Button
            size="sm"
            onClick={() => toast.success("Retry queue drained", { description: `${failed} failed jobs re-queued.` })}
          >
            <ListRestart className="size-3.5" /> Drain retry queue
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Jobs (24h)" value="71,892" delta={9.4} icon={Waypoints} />
        <StatCard label="Running" value="58" delta={4.2} />
        <StatCard label="Failed" value={String(failed)} delta={-14.2} invertDelta tone="danger" />
        <StatCard label="Avg duration" value="8.4s" delta={-3.6} invertDelta tone="success" />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-3">
        <TabsList>
          <TabsTrigger value="all">All jobs</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="retry">Retry queue</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="m-0">
          <DataTable
            columns={columns}
            rows={rows}
            pageSize={12}
            onRowClick={setDetail}
            emptyTitle="No jobs found"
            emptyDescription="Adjust the filters to see more executions."
            toolbar={
              <FilterBar
                search={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search job ID, user, model…"
                filters={[
                  {
                    id: "status",
                    label: "Status",
                    value: status,
                    onChange: setStatus,
                    options: ["queued", "running", "completed", "failed", "retrying", "cancelled"].map((s) => ({
                      label: s,
                      value: s,
                    })),
                  },
                  {
                    id: "model",
                    label: "Model",
                    value: model,
                    onChange: setModel,
                    options: models.map((m) => ({ label: m.name, value: m.name })),
                  },
                ]}
                onReset={() => {
                  setSearch("");
                  setStatus("all");
                  setModel("all");
                }}
              />
            }
          />
        </TabsContent>
      </Tabs>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base">Job {detail?.id}</DialogTitle>
            <DialogDescription>
              {detail?.model} v{detail?.version} · {detail?.region}
            </DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["Status", detail.status],
                  ["Tokens", detail.tokens.toLocaleString()],
                  ["Credits", String(detail.credits)],
                  ["Duration", `${(detail.durationMs / 1000).toFixed(1)}s`],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-md border border-border bg-surface px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</p>
                    <p className="num mt-0.5 text-sm font-medium capitalize">{v}</p>
                  </div>
                ))}
              </div>
              {detail.failureReason && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {detail.failureReason}
                </div>
              )}
              <div className="rounded-md border border-border">
                <ActivityTimeline
                  items={[
                    { id: "1", title: "Job submitted", description: detail.user, at: fmtDateTime(detail.startedAt).slice(11, 19), tone: "info" },
                    { id: "2", title: "Dispatched to worker", description: detail.region, at: fmtDateTime(detail.startedAt).slice(11, 19), tone: "info" },
                    {
                      id: "3",
                      title: detail.status === "failed" ? "Execution failed" : "Execution finished",
                      description: detail.failureReason ?? "Completed without errors",
                      at: detail.completedAt ? fmtDateTime(detail.completedAt).slice(11, 19) : "—",
                      tone: detail.status === "failed" ? "danger" : "success",
                    },
                  ]}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        destructive={confirm?.action === "cancel"}
        title={confirm?.action === "cancel" ? "Cancel this job?" : "Retry this job?"}
        description={
          confirm?.action === "cancel"
            ? `Job ${confirm?.job.id} will be terminated. Consumed credits are not refunded automatically.`
            : `Job ${confirm?.job.id} will be re-queued on ${confirm?.job.model}. Credits will be consumed again.`
        }
        confirmLabel={confirm?.action === "cancel" ? "Cancel job" : "Retry job"}
        onConfirm={() => {
          toast.success(confirm?.action === "cancel" ? "Job cancelled" : "Job re-queued", {
            description: confirm?.job.id,
          });
          setConfirm(null);
        }}
      />
    </>
  );
}
