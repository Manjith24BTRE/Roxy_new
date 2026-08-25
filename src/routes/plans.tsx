import { createFileRoute } from "@tanstack/react-router";
import { Check, CircleDollarSign, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/kit/ChartCard";
import { ConfirmationDialog } from "@/components/kit/ConfirmDialog";
import { PageHeader } from "@/components/kit/PageHeader";
import { StatCard } from "@/components/kit/StatCard";
import { StatusBadge } from "@/components/kit/StatusBadge";
import { compact, money, plans } from "@/lib/mock/data";

export const Route = createFileRoute("/plans")({
  head: () => ({
    meta: [
      { title: "Plans — Veytrix Control Centre" },
      { name: "description", content: "Subscription plan catalogue with pricing, entitlements and subscriber counts." },
      { property: "og:title", content: "Plans — Veytrix Control Centre" },
      { property: "og:description", content: "Manage Veytrix subscription plans and entitlements." },
    ],
  }),
  component: PlansPage,
});

function PlansPage() {
  const [archive, setArchive] = useState<string | null>(null);
  const mrr = plans.reduce((a, p) => a + p.price * p.users, 0);

  return (
    <>
      <PageHeader
        title="Plans"
        description="Pricing tiers, included credits and entitlement bundles offered to customers."
        breadcrumbs={[{ label: "Billing" }, { label: "Plans" }]}
        actions={
          <Button size="sm" onClick={() => toast.success("Draft plan created")}>
            <Plus className="size-3.5" /> New plan
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Active plans" value={String(plans.filter((p) => p.status === "active").length)} icon={CircleDollarSign} />
        <StatCard label="Subscribers" value={compact(plans.reduce((a, p) => a + p.users, 0))} delta={4.2} />
        <StatCard label="Plan MRR" value={money(mrr)} delta={6.1} tone="success" />
        <StatCard label="Avg revenue / user" value={money(Math.round(mrr / plans.reduce((a, p) => a + p.users, 0)))} delta={1.8} />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((p) => (
          <Panel
            key={p.id}
            title={p.name}
            description={`${p.cycle} · ${compact(p.users)} subscribers`}
            actions={<StatusBadge status={p.status} />}
            bodyClassName="flex flex-col gap-4 p-4"
          >
            <div className="flex items-baseline gap-1">
              <span className="num text-3xl font-semibold tracking-tight">{money(p.price)}</span>
              <span className="text-xs text-muted-foreground">/ {p.cycle === "Annual" ? "year" : "month"}</span>
            </div>
            <ul className="space-y-1.5">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-auto flex gap-2 border-t border-border pt-3">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => toast.info(`Editing ${p.name}`)}>
                Edit
              </Button>
              <Button size="sm" variant="ghost" className="flex-1" onClick={() => setArchive(p.name)}>
                Archive
              </Button>
            </div>
          </Panel>
        ))}
      </div>

      <ConfirmationDialog
        open={!!archive}
        onOpenChange={(o) => !o && setArchive(null)}
        destructive
        title={`Archive ${archive}?`}
        description="Existing subscribers keep their pricing, but the plan is hidden from new signups."
        confirmLabel="Archive plan"
        onConfirm={() => {
          toast.success("Plan archived", { description: archive ?? "" });
          setArchive(null);
        }}
      />
    </>
  );
}
