import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable, Mono, type Column } from "@/components/kit/DataTable";
import { FilterBar } from "@/components/kit/FilterBar";
import { StatusBadge } from "@/components/kit/StatusBadge";
import { fmtDateTime, relative, type LogEntry } from "@/lib/mock/data";

const uniq = (arr: string[]) => Array.from(new Set(arr)).sort();

export function LogTable({ entries }: { entries: LogEntry[] }) {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("all");
  const [service, setService] = useState("all");
  const [selected, setSelected] = useState<LogEntry | null>(null);

  const rows = useMemo(
    () =>
      entries.filter((l) => {
        const q = search.toLowerCase();
        const match =
          !q ||
          [l.message, l.endpoint, l.user, l.requestId, l.service].some((f) =>
            f.toLowerCase().includes(q),
          );
        return (
          match &&
          (severity === "all" || l.severity === severity) &&
          (service === "all" || l.service === service)
        );
      }),
    [entries, search, severity, service],
  );

  const columns: Column<LogEntry>[] = [
    {
      key: "timestamp",
      header: "Timestamp",
      render: (l) => (
        <div className="whitespace-nowrap">
          <div className="num text-xs">{fmtDateTime(l.timestamp).slice(5, 19)}</div>
          <div className="text-[11px] text-muted-foreground">{relative(l.timestamp)}</div>
        </div>
      ),
    },
    { key: "severity", header: "Severity", render: (l) => <StatusBadge status={l.severity} /> },
    { key: "service", header: "Service", render: (l) => <Mono>{l.service}</Mono>, hideBelow: "md" },
    { key: "endpoint", header: "Endpoint", render: (l) => <Mono>{l.endpoint}</Mono>, hideBelow: "lg" },
    { key: "user", header: "User", render: (l) => <span className="text-xs">{l.user}</span>, hideBelow: "xl" },
    { key: "requestId", header: "Request ID", render: (l) => <Mono>{l.requestId}</Mono>, hideBelow: "xl" },
    {
      key: "message",
      header: "Message",
      render: (l) => <span className="line-clamp-1 max-w-[28ch] text-sm">{l.message}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (l) => (
        <span
          className={
            l.statusCode >= 500
              ? "num text-destructive"
              : l.statusCode >= 400
                ? "num text-warning"
                : "num text-success"
          }
        >
          {l.statusCode}
        </span>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={rows}
        pageSize={12}
        onRowClick={setSelected}
        emptyTitle="No log entries"
        emptyDescription="No entries match the current search and filters."
        toolbar={
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search message, endpoint, request ID…"
            filters={[
              {
                id: "sev",
                label: "Severity",
                value: severity,
                onChange: setSeverity,
                options: uniq(entries.map((e) => e.severity)).map((s) => ({ label: s, value: s })),
              },
              {
                id: "svc",
                label: "Service",
                value: service,
                onChange: setService,
                options: uniq(entries.map((e) => e.service)).map((s) => ({ label: s, value: s })),
              },
            ]}
            onReset={() => {
              setSearch("");
              setSeverity("all");
              setService("all");
            }}
          >
            <Button variant="outline" size="sm" className="h-9">
              Export CSV
            </Button>
          </FilterBar>
        }
      />

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">Log entry</DialogTitle>
            <DialogDescription className="font-mono text-xs">{selected?.requestId}</DialogDescription>
          </DialogHeader>
          {selected && (
            <dl className="grid grid-cols-3 gap-y-2 text-sm">
              {[
                ["Timestamp", fmtDateTime(selected.timestamp)],
                ["Severity", selected.severity],
                ["Service", selected.service],
                ["Endpoint", selected.endpoint],
                ["User", selected.user],
                ["Status code", String(selected.statusCode)],
                ["Duration", `${selected.durationMs} ms`],
                ["Message", selected.message],
              ].map(([k, v]) => (
                <div key={k} className="col-span-3 grid grid-cols-3 gap-2 border-b border-border pb-2">
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
