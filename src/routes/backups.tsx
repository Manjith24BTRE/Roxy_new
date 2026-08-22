import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DatabaseBackup, HardDriveDownload, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/kit/ConfirmDialog";
import { Panel } from "@/components/kit/ChartCard";
import { DataTable, CellStack, Mono, type Column } from "@/components/kit/DataTable";
import { FilterBar } from "@/components/kit/FilterBar";
import { PageHeader } from "@/components/kit/PageHeader";
import { StatCard } from "@/components/kit/StatCard";
import { StatusBadge } from "@/components/kit/StatusBadge";
import { fmtDateTime, relative, useControlCenterData } from "@/lib/control-center-data";

export const Route = createFileRoute("/backups")({
  head: () => ({
    meta: [
      { title: "Backups — Veytrix Control Centre" },
      {
        name: "description",
        content:
          "Database, storage and configuration backup history with retention, region and restore controls.",
      },
      { property: "og:title", content: "Backups — Veytrix Control Centre" },
      { property: "og:description", content: "Backup and restore operations for Veytrix." },
    ],
  }),
  component: BackupsPage,
});

type Backup = ReturnType<typeof useControlCenterData>["backups"][number];

function BackupsPage() {
  const { backups } = useControlCenterData();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [restore, setRestore] = useState<Backup | null>(null);

  const rows = useMemo(
    () =>
      backups.filter(
        (b) =>
          (!search ||
            [b.id, b.location, b.type].some((f) =>
              f.toLowerCase().includes(search.toLowerCase()),
            )) &&
          (type === "all" || b.type === type),
      ),
    [search, type],
  );

  const columns: Column<Backup>[] = [
    {
      key: "id",
      header: "Backup",
      render: (b) => (
        <CellStack
          primary={<Mono className="text-foreground">{b.id}</Mono>}
          secondary={`${b.type} · ${b.scope}`}
        />
      ),
    },
    {
      key: "size",
      header: "Size",
      render: (b) => <span className="num">{b.size}</span>,
      hideBelow: "md",
    },
    { key: "status", header: "Status", render: (b) => <StatusBadge status={b.status} /> },
    {
      key: "dur",
      header: "Duration",
      render: (b) => <span className="num">{Math.round(b.durationMs / 1000)}s</span>,
      hideBelow: "lg",
    },
    { key: "loc", header: "Region", render: (b) => <Mono>{b.location}</Mono>, hideBelow: "xl" },
    {
      key: "ret",
      header: "Retention",
      render: (b) => <span className="text-sm">{b.retention}</span>,
      hideBelow: "xl",
    },
    {
      key: "at",
      header: "Started",
      render: (b) => <span className="num text-xs">{fmtDateTime(b.startedAt).slice(0, 16)}</span>,
      hideBelow: "md",
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (b) => (
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2"
          disabled={b.status !== "completed"}
          onClick={() => setRestore(b)}
        >
          <RotateCcw className="size-3.5" /> Restore
        </Button>
      ),
    },
  ];

  const last = backups.find((b) => b.status === "completed");

  return (
    <>
      <PageHeader
        title="Backups"
        description="Automated and manual snapshots of the database, object storage and platform configuration."
        breadcrumbs={[{ label: "System" }, { label: "Backups" }]}
        actions={
          <Button size="sm" onClick={() => toast.success("Manual backup started")}>
            <DatabaseBackup className="size-3.5" /> Run backup now
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="Backups retained"
          value={String(backups.length)}
          icon={HardDriveDownload}
        />
        <StatCard
          label="Last successful"
          value={last ? relative(last.startedAt) : "—"}
          tone="success"
        />
        <StatCard
          label="Failed (30d)"
          value={String(backups.filter((b) => b.status === "failed").length)}
          tone="danger"
        />
        <StatCard label="Storage used" value="No data available" />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Panel
          title="Schedule"
          description="Automated policy"
          bodyClassName="divide-y divide-border"
        >
          {[
            ["Database full", "Daily · 02:00 UTC"],
            ["Database incremental", "Every 6 hours"],
            ["Object storage", "Daily · 03:30 UTC"],
            ["Configuration", "On change"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span className="text-muted-foreground">{k}</span>
              <span className="num text-xs font-medium">{v}</span>
            </div>
          ))}
        </Panel>
        <Panel
          title="Recovery objectives"
          bodyClassName="divide-y divide-border"
          className="lg:col-span-2"
        >
          {[
            ["RPO (recovery point objective)", "15 minutes"],
            ["RTO (recovery time objective)", "45 minutes"],
            ["Cross-region replication", "Enabled · eu-west-1"],
            ["Last restore drill", "Passed · 12 days ago"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span className="text-muted-foreground">{k}</span>
              <span className="num text-xs font-medium">{v}</span>
            </div>
          ))}
        </Panel>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        pageSize={10}
        emptyTitle="No backups"
        toolbar={
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search backup ID or region…"
            filters={[
              {
                id: "type",
                label: "Type",
                value: type,
                onChange: setType,
                options: ["Database", "Storage", "Configuration"].map((t) => ({
                  label: t,
                  value: t,
                })),
              },
            ]}
            onReset={() => {
              setSearch("");
              setType("all");
            }}
          />
        }
      />

      <ConfirmationDialog
        open={!!restore}
        onOpenChange={(o) => !o && setRestore(null)}
        destructive
        title="Restore from this backup?"
        description={`${restore?.id} (${restore?.size}) will overwrite current ${restore?.type.toLowerCase()} state. The platform enters read-only mode during restore.`}
        confirmLabel="Start restore"
        onConfirm={() => {
          toast.success("Restore initiated", { description: restore?.id });
          setRestore(null);
        }}
      />
    </>
  );
}
