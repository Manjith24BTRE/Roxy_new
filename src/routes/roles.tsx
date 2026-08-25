import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Plus, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/kit/ChartCard";
import { ConfirmationDialog } from "@/components/kit/ConfirmDialog";
import { PageHeader } from "@/components/kit/PageHeader";
import { StatCard } from "@/components/kit/StatCard";
import { StatusBadge } from "@/components/kit/StatusBadge";
import { permissionMatrix, roles } from "@/lib/mock/data";

export const Route = createFileRoute("/roles")({
  head: () => ({
    meta: [
      { title: "Roles — Veytrix Control Centre" },
      { name: "description", content: "Role-based access control: administrative roles, scope, membership and granted permissions." },
      { property: "og:title", content: "Roles — Veytrix Control Centre" },
      { property: "og:description", content: "Manage administrative roles and their scope." },
    ],
  }),
  component: RolesPage,
});

function RolesPage() {
  const [remove, setRemove] = useState<string | null>(null);

  return (
    <>
      <PageHeader
        title="Roles"
        description="Administrative roles, their operational scope and how many operators hold them."
        breadcrumbs={[{ label: "Security" }, { label: "Roles" }]}
        actions={
          <Button size="sm" onClick={() => toast.success("Role draft created")}>
            <Plus className="size-3.5" /> New role
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Roles" value={String(roles.length)} icon={ShieldCheck} />
        <StatCard label="Operators" value={String(roles.reduce((a, r) => a + r.members, 0))} icon={Users} />
        <StatCard label="System roles" value={String(roles.filter((r) => r.system).length)} icon={Lock} />
        <StatCard label="Privileged holders" value="3" tone="warning" />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {roles.map((r) => (
          <Panel
            key={r.id}
            title={r.name}
            description={r.scope}
            actions={<StatusBadge status={r.system ? "primary" : "active"} label={r.system ? "system" : "custom"} />}
            bodyClassName="flex flex-col gap-3 p-4"
          >
            <p className="text-sm text-muted-foreground">{r.description}</p>
            <div className="flex flex-wrap gap-1">
              {(permissionMatrix[r.name] ?? []).slice(0, 5).map((p) => (
                <span key={p} className="num rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {p}
                </span>
              ))}
              {(permissionMatrix[r.name]?.length ?? 0) > 5 && (
                <span className="num rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  +{(permissionMatrix[r.name]?.length ?? 0) - 5}
                </span>
              )}
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
              <span className="num text-xs text-muted-foreground">{r.members} members</span>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => toast.info(`Editing ${r.name}`)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs"
                  disabled={r.system}
                  onClick={() => setRemove(r.name)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <ConfirmationDialog
        open={!!remove}
        onOpenChange={(o) => !o && setRemove(null)}
        destructive
        title={`Delete ${remove}?`}
        description="Operators holding this role lose its permissions immediately and fall back to their remaining roles."
        confirmLabel="Delete role"
        onConfirm={() => {
          toast.success("Role deleted", { description: remove ?? "" });
          setRemove(null);
        }}
      />
    </>
  );
}
