import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useState } from "react";
import { Check, KeyRound, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/kit/ChartCard";
import { SearchBar } from "@/components/kit/FilterBar";
import { PageHeader } from "@/components/kit/PageHeader";
import { StatCard } from "@/components/kit/StatCard";
import { permissionGroups, permissionMatrix, roles } from "@/lib/mock/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/permissions")({
  head: () => ({
    meta: [
      { title: "Permissions — Veytrix Control Centre" },
      { name: "description", content: "Permission matrix mapping every capability to the administrative roles that hold it." },
      { property: "og:title", content: "Permissions — Veytrix Control Centre" },
      { property: "og:description", content: "Inspect and edit the Veytrix permission matrix." },
    ],
  }),
  component: PermissionsPage,
});

function PermissionsPage() {
  const [search, setSearch] = useState("");
  const [matrix, setMatrix] = useState<Record<string, string[]>>(() => ({ ...permissionMatrix }));

  const toggle = (role: string, key: string) =>
    setMatrix((m) => {
      const list = m[role] ?? [];
      return { ...m, [role]: list.includes(key) ? list.filter((k) => k !== key) : [...list, key] };
    });

  const totalKeys = permissionGroups.reduce((a, g) => a + g.keys.length, 0);

  return (
    <>
      <PageHeader
        title="Permissions"
        description="Fine-grained capability matrix. Changes apply to every operator holding the role."
        breadcrumbs={[{ label: "Security" }, { label: "Permissions" }]}
        actions={
          <Button size="sm" onClick={() => toast.success("Permission matrix saved")}>
            <Save className="size-3.5" /> Save changes
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Permissions" value={String(totalKeys)} icon={KeyRound} />
        <StatCard label="Groups" value={String(permissionGroups.length)} />
        <StatCard label="Roles mapped" value={String(roles.length)} />
        <StatCard label="Destructive scopes" value="4" tone="warning" />
      </div>

      <Panel title="Permission matrix" description="Toggle a cell to grant or revoke" bodyClassName="p-0">
        <div className="border-b border-border p-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Filter permission keys…" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="sticky left-0 z-10 bg-surface px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Permission
                </th>
                {roles.map((r) => (
                  <th key={r.id} className="px-3 py-2.5 text-center text-xs font-medium text-muted-foreground">
                    {r.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionGroups.map((g) => {
                const keys = g.keys.filter((k) => !search || k.includes(search.toLowerCase()));
                if (keys.length === 0) return null;
                return (
                  <Fragment key={g.group}>
                    <tr className="bg-muted/40">
                      <td colSpan={roles.length + 1} className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {g.group}
                      </td>
                    </tr>
                    {keys.map((k) => (
                      <tr key={k} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="num sticky left-0 z-10 bg-card px-4 py-2 text-xs">{k}</td>
                        {roles.map((r) => {
                          const on = (matrix[r.name] ?? []).includes(k);
                          return (
                            <td key={r.id} className="px-3 py-2 text-center">
                              <button
                                type="button"
                                aria-label={`${on ? "Revoke" : "Grant"} ${k} for ${r.name}`}
                                onClick={() => toggle(r.name, k)}
                                className={cn(
                                  "inline-flex size-6 items-center justify-center rounded-md border transition-colors",
                                  on
                                    ? "border-success/40 bg-success/15 text-success hover:bg-success/25"
                                    : "border-border bg-surface text-muted-foreground hover:bg-muted",
                                )}
                              >
                                {on ? <Check className="size-3.5" /> : <X className="size-3.5 opacity-50" />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
