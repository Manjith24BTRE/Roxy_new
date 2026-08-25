import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileClock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable, CellStack, Mono, type Column } from "@/components/kit/DataTable";
import { FilterBar } from "@/components/kit/FilterBar";
import { PageHeader } from "@/components/kit/PageHeader";
import { StatCard } from "@/components/kit/StatCard";
import { StatusBadge } from "@/components/kit/StatusBadge";
import { auditLogs, fmtDateTime, relative, type AuditLog } from "@/lib/mock/data";

export const Route = createFileRoute("/audit-logs")({
  head: () => ({
    meta: [
      { title: "Audit Logs — Veytrix Control Centre" },
      {
        name: "description",
        content:
          "Immutable record of every administrative action: actor, resource, IP address, device and result.",
      },
      { property: "og:title", content: "Audit Logs — Veytrix Control Centre" },
      { property: "og:description", content: "Immutable trail of administrative actions." },
    ],
  }),
  component: AuditLogsPage,
});

function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("all");
  const [actor, setActor] = useState("all");
  const [detail, setDetail] = useState<AuditLog | null>(null);

  const rows = useMemo(
    () =>
      auditLogs.filter((a) => {
        const q = search.toLowerCase();
        const match = !q || [a.actor, a.action, a.resourceId, a.ip].some((f) => f.toLowerCase().includes(q));
        return match && (action === "all" || a.action === action) && (actor === "all" || a.actor === actor);
      }),
    [search, action, actor],
  );

  const columns: Column<AuditLog>[] = [
    {
      key: "ts",
      header: "Timestamp",
      render: (a) => (
        <div>
          <div className="num text-xs">{fmtDateTime(a.timestamp).slice(0, 16)}</div>
          <div className="text-[11px] text-muted-foreground">{relative(a.timestamp)}</div>
        </div>
      ),
    },
    { key: "actor", header: "Actor", render: (a) => <span className="text-sm">{a.actor}</span>, hideBelow: "md" },
    { key: "action", header: "Action", render: (a) => <Mono className="text-foreground">{a.action}</Mono> },
    { key: "resource", header: "Resource", render: (a) => <CellStack primary={a.resource} secondary={a.resourceId} />, hideBelow: "lg" },
    { key: "ip", header: "IP Address", render: (a) => <Mono>{a.ip}</Mono>, hideBelow: "xl" },
    { key: "device", header: "Device", render: (a) => <span className="text-xs text-muted-foreground">{a.device}</span>, hideBelow: "xl" },
    { key: "result", header: "Result", render: (a) => <StatusBadge status={a.result} /> },
  ];

  return (
    <>
      <PageHeader
        title="Audit Logs"
        description="Tamper-evident history of privileged operations across the control centre."
        breadcrumbs={[{ label: "Security" }, { label: "Audit Logs" }]}
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Events (30d)" value={auditLogs.length.toLocaleString()} icon={FileClock} />
        <StatCard label="Failed actions" value={String(auditLogs.filter((a) => a.result === "failed").length)} delta={12.5} invertDelta tone="danger" />
        <StatCard label="Distinct actors" value={String(new Set(auditLogs.map((a) => a.actor)).size)} />
        <StatCard label="Retention" value="7 years" footer="WORM storage" />
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        pageSize={12}
        onRowClick={setDetail}
        emptyTitle="No audit events"
        toolbar={
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search actor, action, resource, IP…"
            filters={[
              {
                id: "action",
                label: "Action",
                value: action,
                onChange: setAction,
                options: Array.from(new Set(auditLogs.map((a) => a.action))).sort().map((s) => ({ label: s, value: s })),
              },
              {
                id: "actor",
                label: "Actor",
                value: actor,
                onChange: setActor,
                options: Array.from(new Set(auditLogs.map((a) => a.actor))).sort().map((s) => ({ label: s, value: s })),
              },
            ]}
            onReset={() => {
              setSearch("");
              setAction("all");
              setActor("all");
            }}
          />
        }
      />
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">{detail?.action}</DialogTitle>
            <DialogDescription className="font-mono text-xs">{detail?.id}</DialogDescription>
          </DialogHeader>
          {detail && (
            <dl className="space-y-2 text-sm">
              {[
                ["Timestamp", fmtDateTime(detail.timestamp)],
                ["Actor", detail.actor],
                ["Resource", `${detail.resource} · ${detail.resourceId}`],
                ["IP address", detail.ip],
                ["Device", detail.device],
                ["Result", detail.result],
                ["Reason", detail.metadata["reason"] ?? "—"],
                ["Linked ticket", detail.metadata["ticket"] ?? "—"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-3 gap-2 border-b border-border pb-2">
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="col-span-2 break-words text-xs">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
