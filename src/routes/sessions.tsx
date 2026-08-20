import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LogOut, MonitorCog } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/kit/ConfirmDialog";
import { DataTable, CellStack, Mono, type Column } from "@/components/kit/DataTable";
import { FilterBar } from "@/components/kit/FilterBar";
import { PageHeader } from "@/components/kit/PageHeader";
import { StatCard } from "@/components/kit/StatCard";
import { StatusBadge } from "@/components/kit/StatusBadge";
import { relative, sessions } from "@/lib/mock/data";

export const Route = createFileRoute("/sessions")({
  head: () => ({
    meta: [
      { title: "Sessions — Veytrix Control Centre" },
      { name: "description", content: "Active user sessions with device, geography and revocation controls." },
      { property: "og:title", content: "Sessions — Veytrix Control Centre" },
      { property: "og:description", content: "Monitor and revoke active platform sessions." },
    ],
  }),
  component: SessionsPage,
});

type Row = (typeof sessions)[number];

function SessionsPage() {
  const [search, setSearch] = useState("");
  const [revoke, setRevoke] = useState<Row | null>(null);

  const rows = useMemo(
    () => sessions.filter((s) => !search || [s.user, s.ip, s.location, s.device].some((f) => f.toLowerCase().includes(search.toLowerCase()))),
    [search],
  );

  const columns: Column<Row>[] = [
    { key: "user", header: "User", render: (s) => <CellStack primary={s.user} secondary={s.id} /> },
    { key: "device", header: "Device", render: (s) => <span className="text-sm">{s.device}</span>, hideBelow: "md" },
    { key: "loc", header: "Location", render: (s) => <span className="text-sm">{s.location}</span>, hideBelow: "lg" },
    { key: "ip", header: "IP", render: (s) => <Mono>{s.ip}</Mono>, hideBelow: "xl" },
    { key: "status", header: "Status", render: (s) => <StatusBadge status={s.status} /> },
    { key: "seen", header: "Last seen", render: (s) => <span className="num text-xs">{relative(s.lastSeen)}</span>, hideBelow: "md" },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (s) => (
        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setRevoke(s)}>
          <LogOut className="size-3.5" /> Revoke
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Sessions" description="Live authenticated sessions across web, mobile and API clients." breadcrumbs={[{ label: "Sessions" }]} />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Active sessions" value={String(sessions.length)} delta={3.9} icon={MonitorCog} />
        <StatCard label="Mobile share" value="34%" delta={7.1} />
        <StatCard label="Suspicious" value="2" delta={100} invertDelta tone="warning" />
        <StatCard label="Avg duration" value="42m" delta={-1.2} />
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        pageSize={10}
        emptyTitle="No sessions"
        toolbar={<FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search user, IP, device…" onReset={() => setSearch("")} />}
      />
      <ConfirmationDialog
        open={!!revoke}
        onOpenChange={(o) => !o && setRevoke(null)}
        destructive
        title="Revoke this session?"
        description={`${revoke?.user} will be signed out on ${revoke?.device} immediately.`}
        confirmLabel="Revoke session"
        onConfirm={() => {
          toast.success("Session revoked", { description: revoke?.id });
          setRevoke(null);
        }}
      />
    </>
  );
}
