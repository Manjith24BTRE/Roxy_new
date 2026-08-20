import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LifeBuoy, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { DataTable, CellStack, Mono, type Column } from "@/components/kit/DataTable";
import { FilterBar } from "@/components/kit/FilterBar";
import { PageHeader } from "@/components/kit/PageHeader";
import { StatCard } from "@/components/kit/StatCard";
import { StatusBadge } from "@/components/kit/StatusBadge";
import { fmtDateTime, relative, tickets, type Ticket } from "@/lib/mock/data";

export const Route = createFileRoute("/tickets")({
  head: () => ({
    meta: [
      { title: "Support Tickets — Veytrix Control Centre" },
      { name: "description", content: "Support queue with priority, ownership, SLA state and full conversation history." },
      { property: "og:title", content: "Support Tickets — Veytrix Control Centre" },
      { property: "og:description", content: "Operate the Veytrix support queue." },
    ],
  }),
  component: TicketsPage,
});

const PRIORITY_TONE: Record<string, string> = { low: "info", medium: "pending", high: "warning", urgent: "failed" };

function TicketsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [open, setOpen] = useState<Ticket | null>(null);
  const [reply, setReply] = useState("");

  const rows = useMemo(
    () =>
      tickets.filter(
        (t) =>
          (!search || [t.subject, t.user, t.id].some((f) => f.toLowerCase().includes(search.toLowerCase()))) &&
          (status === "all" || t.status === status) &&
          (priority === "all" || t.priority === priority),
      ),
    [search, status, priority],
  );

  const columns: Column<Ticket>[] = [
    { key: "id", header: "Ticket", render: (t) => <CellStack primary={t.subject} secondary={<Mono>{t.id}</Mono>} /> },
    { key: "user", header: "Requester", render: (t) => <span className="text-sm">{t.user}</span>, hideBelow: "lg" },
    { key: "cat", header: "Category", render: (t) => <span className="text-sm">{t.category}</span>, hideBelow: "xl" },
    { key: "priority", header: "Priority", render: (t) => <StatusBadge status={PRIORITY_TONE[t.priority] ?? "info"} label={t.priority} /> },
    { key: "status", header: "Status", render: (t) => <StatusBadge status={t.status} /> },
    { key: "agent", header: "Agent", render: (t) => <span className="text-sm">{t.agent}</span>, hideBelow: "md" },
    { key: "upd", header: "Updated", render: (t) => <span className="num text-xs">{relative(t.updatedAt)}</span>, hideBelow: "md" },
  ];

  return (
    <>
      <PageHeader
        title="Support Tickets"
        description="Customer conversations with priority, ownership and internal notes."
        breadcrumbs={[{ label: "Support" }, { label: "Tickets" }]}
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Open tickets" value={String(tickets.filter((t) => ["open", "assigned", "in_progress"].includes(t.status)).length)} delta={-4.1} invertDelta tone="success" icon={LifeBuoy} />
        <StatCard label="Urgent" value={String(tickets.filter((t) => t.priority === "urgent").length)} delta={9.2} invertDelta tone="danger" />
        <StatCard label="Median first response" value="34m" delta={-11.4} invertDelta tone="success" />
        <StatCard label="CSAT" value="4.6 / 5" delta={2.2} />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        pageSize={10}
        onRowClick={(t) => setOpen(t)}
        emptyTitle="No tickets match"
        toolbar={
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search subject, requester or ID…"
            filters={[
              {
                id: "status",
                label: "Status",
                value: status,
                onChange: setStatus,
                options: ["open", "assigned", "in_progress", "waiting", "resolved", "closed"].map((s) => ({ label: s.replace(/_/g, " "), value: s })),
              },
              {
                id: "priority",
                label: "Priority",
                value: priority,
                onChange: setPriority,
                options: ["low", "medium", "high", "urgent"].map((s) => ({ label: s, value: s })),
              },
            ]}
            onReset={() => {
              setSearch("");
              setStatus("all");
              setPriority("all");
            }}
          />
        }
      />

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="pr-6 text-base">{open?.subject}</SheetTitle>
            <SheetDescription>
              {open?.id} · {open?.user} · opened {open ? relative(open.createdAt) : ""}
            </SheetDescription>
          </SheetHeader>
          {open && (
            <div className="space-y-4 px-4 pb-6">
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={open.status} />
                <StatusBadge status={PRIORITY_TONE[open.priority] ?? "info"} label={`${open.priority} priority`} />
                <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-[11px]">{open.category}</span>
                <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-[11px]">{open.agent}</span>
              </div>

              <div className="space-y-3">
                {open.messages.map((m, i) => (
                  <div key={i} className="rounded-lg border border-border bg-surface p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{m.author}</span>
                      <span className="num text-muted-foreground">{fmtDateTime(m.at).slice(0, 16)}</span>
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">{m.body}</p>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Internal notes</h3>
                <div className="mt-2 space-y-2">
                  {open.notes.map((n, i) => (
                    <div key={i} className="rounded-lg border border-warning/30 bg-warning/8 p-3 text-sm">
                      <span className="text-xs font-medium">{n.author}</span>
                      <p className="mt-1 text-muted-foreground">{n.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write a reply to the customer…"
                  className="min-h-24 text-sm"
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      toast.success("Reply sent", { description: open.user });
                      setReply("");
                    }}
                  >
                    <Send className="size-3.5" /> Send reply
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success("Ticket assigned to you")}>
                    Assign to me
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success("Ticket resolved")}>
                    Mark resolved
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
