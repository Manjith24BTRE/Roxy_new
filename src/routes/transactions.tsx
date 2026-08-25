import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Receipt, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/kit/ConfirmDialog";
import { DataTable, CellStack, Mono, type Column } from "@/components/kit/DataTable";
import { FilterBar } from "@/components/kit/FilterBar";
import { PageHeader } from "@/components/kit/PageHeader";
import { StatCard } from "@/components/kit/StatCard";
import { StatusBadge } from "@/components/kit/StatusBadge";
import { fmtDate, money, transactions, type Transaction } from "@/lib/mock/data";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — Veytrix Control Centre" },
      {
        name: "description",
        content: "Payment history, refunds and settlement status for every Veytrix billing event.",
      },
      { property: "og:title", content: "Transactions — Veytrix Control Centre" },
      { property: "og:description", content: "Billing events, refunds and settlement status." },
    ],
  }),
  component: TransactionsPage,
});

function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [plan, setPlan] = useState("all");
  const [refund, setRefund] = useState<Transaction | null>(null);

  const rows = useMemo(
    () =>
      transactions.filter((t) => {
        const q = search.toLowerCase();
        const match = !q || [t.id, t.user, t.invoice, t.method].some((f) => f.toLowerCase().includes(q));
        return match && (status === "all" || t.status === status) && (plan === "all" || t.plan === plan);
      }),
    [search, status, plan],
  );

  const gross = transactions.filter((t) => t.status === "success").reduce((a, t) => a + t.amount, 0);
  const refunded = transactions.filter((t) => t.status === "refunded").reduce((a, t) => a + t.amount, 0);
  const failed = transactions.filter((t) => t.status === "failed").length;

  const columns: Column<Transaction>[] = [
    { key: "id", header: "Transaction", render: (t) => <CellStack primary={<Mono className="text-foreground">{t.id}</Mono>} secondary={t.invoice} /> },
    { key: "user", header: "User", render: (t) => <span className="text-sm">{t.user}</span>, hideBelow: "md" },
    { key: "plan", header: "Plan", render: (t) => <span className="text-sm">{t.plan}</span>, hideBelow: "lg" },
    { key: "amount", header: "Amount", render: (t) => <span className="num font-medium">{money(t.amount)}</span> },
    { key: "method", header: "Method", render: (t) => <span className="text-xs text-muted-foreground">{t.method}</span>, hideBelow: "xl" },
    { key: "status", header: "Status", render: (t) => <StatusBadge status={t.status} /> },
    { key: "date", header: "Date", render: (t) => <span className="num text-xs">{fmtDate(t.date)}</span>, hideBelow: "md" },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (t) => (
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2"
          disabled={t.status !== "success"}
          onClick={() => setRefund(t)}
        >
          <Undo2 className="size-3.5" /> Refund
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Transactions"
        description="Every charge, refund and settlement processed by the billing service."
        breadcrumbs={[{ label: "Billing" }, { label: "Transactions" }]}
        actions={
          <Button size="sm" variant="outline" onClick={() => toast.success("Export started")}>
            <Download className="size-3.5" /> Export
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Gross volume" value={money(gross)} delta={6.1} icon={Receipt} tone="success" />
        <StatCard label="Refunded" value={money(refunded)} delta={-2.4} invertDelta />
        <StatCard label="Failed payments" value={String(failed)} delta={1.8} invertDelta tone="danger" />
        <StatCard label="Avg order value" value={money(gross / Math.max(1, transactions.length))} delta={3.2} />
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        pageSize={12}
        emptyTitle="No transactions"
        toolbar={
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search transaction, invoice, user…"
            filters={[
              {
                id: "status",
                label: "Status",
                value: status,
                onChange: setStatus,
                options: ["success", "pending", "failed", "refunded"].map((s) => ({ label: s, value: s })),
              },
              {
                id: "plan",
                label: "Plan",
                value: plan,
                onChange: setPlan,
                options: ["Starter", "Growth", "Scale", "Enterprise"].map((s) => ({ label: s, value: s })),
              },
            ]}
            onReset={() => {
              setSearch("");
              setStatus("all");
              setPlan("all");
            }}
          />
        }
      />
      <ConfirmationDialog
        open={!!refund}
        onOpenChange={(o) => !o && setRefund(null)}
        destructive
        title="Issue a refund?"
        description={`${money(refund?.amount ?? 0)} will be returned to ${refund?.user} via ${refund?.method}. This action is recorded in the audit log.`}
        confirmLabel="Issue refund"
        onConfirm={() => {
          toast.success("Refund issued", { description: refund?.invoice });
          setRefund(null);
        }}
      />
    </>
  );
}
