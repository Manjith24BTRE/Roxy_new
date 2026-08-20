import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Coins, Gift } from "lucide-react";
import { toast } from "sonner";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { ChartCard } from "@/components/kit/ChartCard";
import { DataTable, CellStack, Mono, type Column } from "@/components/kit/DataTable";
import { FilterBar } from "@/components/kit/FilterBar";
import { PageHeader } from "@/components/kit/PageHeader";
import { StatCard } from "@/components/kit/StatCard";
import { StatusBadge } from "@/components/kit/StatusBadge";
import { axisProps, chartTooltip, gridProps } from "@/components/kit/chart-theme";
import { compact, creditTransactions, creditsSeries, fmtDateTime, type CreditTx } from "@/lib/mock/data";

export const Route = createFileRoute("/credits")({
  head: () => ({
    meta: [
      { title: "Credits — Veytrix Control Centre" },
      { name: "description", content: "Credit ledger covering purchases, consumption, refunds and administrative grants." },
      { property: "og:title", content: "Credits — Veytrix Control Centre" },
      { property: "og:description", content: "Track and adjust customer credit balances." },
    ],
  }),
  component: CreditsPage,
});

function CreditsPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");

  const rows = useMemo(
    () =>
      creditTransactions.filter(
        (c) =>
          (!search || [c.user, c.reference, c.id].some((f) => f.toLowerCase().includes(search.toLowerCase()))) &&
          (type === "all" || c.type === type),
      ),
    [search, type],
  );

  const columns: Column<CreditTx>[] = [
    { key: "id", header: "Entry", render: (c) => <CellStack primary={<Mono className="text-foreground">{c.id}</Mono>} secondary={c.user} /> },
    { key: "type", header: "Type", render: (c) => <StatusBadge status={c.type === "consumption" ? "info" : c.type === "refund" ? "warning" : "success"} label={c.type} /> },
    {
      key: "amount",
      header: "Amount",
      render: (c) => <span className={c.amount < 0 ? "num text-destructive" : "num text-success"}>{c.amount > 0 ? "+" : ""}{c.amount.toLocaleString()}</span>,
    },
    { key: "balance", header: "Balance after", render: (c) => <span className="num">{c.balance.toLocaleString()}</span>, hideBelow: "md" },
    { key: "ref", header: "Reference", render: (c) => <Mono>{c.reference}</Mono>, hideBelow: "lg" },
    { key: "date", header: "Date", render: (c) => <span className="num text-xs">{fmtDateTime(c.date).slice(0, 16)}</span>, hideBelow: "md" },
  ];

  const purchased = creditTransactions.filter((c) => c.amount > 0).reduce((a, c) => a + c.amount, 0);
  const consumed = creditTransactions.filter((c) => c.amount < 0).reduce((a, c) => a - c.amount, 0);

  return (
    <>
      <PageHeader
        title="Credits"
        description="Every credit movement across the platform, with balances and originating reference."
        breadcrumbs={[{ label: "Billing" }, { label: "Credits" }]}
        actions={
          <Button size="sm" onClick={() => toast.success("Credits granted", { description: "5,000 credits added." })}>
            <Gift className="size-3.5" /> Grant credits
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Credits issued" value={compact(purchased)} delta={8.4} icon={Coins} />
        <StatCard label="Credits consumed" value={compact(consumed)} delta={11.2} />
        <StatCard label="Outstanding balance" value="4.82M" delta={-2.4} />
        <StatCard label="Refunded" value={compact(creditTransactions.filter((c) => c.type === "refund").reduce((a, c) => a + c.amount, 0))} delta={-18.9} invertDelta tone="success" />
      </div>

      <ChartCard title="Credit flow" description="Purchased vs consumed per month" height={280}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={creditsSeries} margin={{ top: 6, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="gPurch" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gCons" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-chart-4)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--color-chart-4)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="month" {...axisProps} />
            <YAxis {...axisProps} tickFormatter={(v) => compact(Number(v))} />
            <Tooltip {...chartTooltip} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="purchased" stroke="var(--color-chart-2)" fill="url(#gPurch)" strokeWidth={2} />
            <Area type="monotone" dataKey="consumed" stroke="var(--color-chart-4)" fill="url(#gCons)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <DataTable
        columns={columns}
        rows={rows}
        pageSize={10}
        emptyTitle="No credit entries"
        toolbar={
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search user, entry or reference…"
            filters={[
              {
                id: "type",
                label: "Type",
                value: type,
                onChange: setType,
                options: ["purchase", "consumption", "refund", "grant"].map((t) => ({ label: t, value: t })),
              },
            ]}
            onReset={() => {
              setSearch("");
              setType("all");
            }}
          />
        }
      />
    </>
  );
}
