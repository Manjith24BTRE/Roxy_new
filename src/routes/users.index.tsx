import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Ban, Eye, MoreHorizontal, Pencil, ShieldOff, Undo2, UserPlus, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { ConfirmationDialog } from "@/components/kit/ConfirmDialog";
import { DataTable, CellStack, type Column } from "@/components/kit/DataTable";
import { FilterBar } from "@/components/kit/FilterBar";
import { PageHeader } from "@/components/kit/PageHeader";
import { StatCard } from "@/components/kit/StatCard";
import { StatusBadge } from "@/components/kit/StatusBadge";
import { fmtDate, relative, users, type User } from "@/lib/mock/data";

export const Route = createFileRoute("/users/")({
  head: () => ({
    meta: [
      { title: "Users — Veytrix Control Centre" },
      {
        name: "description",
        content:
          "Search, inspect and administer every Veytrix account: plans, credits, usage, status and lifecycle actions.",
      },
      { property: "og:title", content: "Users — Veytrix Control Centre" },
      { property: "og:description", content: "Account administration for the Veytrix platform." },
    ],
  }),
  component: UsersPage,
});

function UsersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [plan, setPlan] = useState("all");
  const [pending, setPending] = useState<{ user: User; action: "suspend" | "ban" | "refund" } | null>(null);

  const rows = useMemo(
    () =>
      users.filter((u) => {
        const q = search.toLowerCase();
        const match = !q || [u.name, u.email, u.id].some((f) => f.toLowerCase().includes(q));
        return match && (status === "all" || u.status === status) && (plan === "all" || u.plan === plan);
      }),
    [search, status, plan],
  );

  const columns: Column<User>[] = [
    {
      key: "user",
      header: "User",
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-xs font-semibold">
            {u.name.split(" ").map((p) => p[0]).join("")}
          </span>
          <CellStack primary={u.name} secondary={u.id} />
        </div>
      ),
    },
    { key: "email", header: "Email", render: (u) => <span className="text-sm">{u.email}</span>, hideBelow: "lg" },
    { key: "plan", header: "Plan", render: (u) => <span className="text-sm">{u.plan}</span>, hideBelow: "md" },
    { key: "credits", header: "Credits", render: (u) => <span className="num">{u.credits.toLocaleString()}</span>, hideBelow: "xl" },
    {
      key: "usage",
      header: "Usage",
      hideBelow: "xl",
      render: (u) => (
        <div className="w-24">
          <Progress value={u.usage} className="h-1.5" />
          <span className="num text-[11px] text-muted-foreground">{u.usage}%</span>
        </div>
      ),
    },
    { key: "status", header: "Status", render: (u) => <StatusBadge status={u.status} /> },
    { key: "last", header: "Last login", render: (u) => <span className="num text-xs">{relative(u.lastLogin)}</span>, hideBelow: "md" },
    { key: "created", header: "Created", render: (u) => <span className="num text-xs">{fmtDate(u.createdAt)}</span>, hideBelow: "xl" },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (u) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7" aria-label={`Actions for ${u.name}`}>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => navigate({ to: "/users/$userId", params: { userId: u.id } })}>
                <Eye className="size-3.5" /> View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Edit drawer", { description: u.email })}>
                <Pencil className="size-3.5" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setPending({ user: u, action: "suspend" })}>
                <ShieldOff className="size-3.5" /> Suspend
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPending({ user: u, action: "ban" })}>
                <Ban className="size-3.5" /> Ban
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPending({ user: u, action: "refund" })}>
                <Undo2 className="size-3.5" /> Refund
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const active = users.filter((u) => u.status === "active").length;

  return (
    <>
      <PageHeader
        title="Users"
        description="Account directory with plan, consumption and lifecycle state for every tenant member."
        breadcrumbs={[{ label: "Users" }]}
        actions={
          <Button size="sm" onClick={() => toast.success("Invitation sent")}>
            <UserPlus className="size-3.5" /> Invite user
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Total accounts" value={users.length.toLocaleString()} delta={4.8} icon={UsersIcon} />
        <StatCard label="Active" value={String(active)} delta={3.1} tone="success" />
        <StatCard label="Suspended" value={String(users.filter((u) => u.status === "suspended").length)} delta={-6.2} invertDelta tone="warning" />
        <StatCard label="2FA adoption" value={`${Math.round((users.filter((u) => u.twoFactor).length / users.length) * 100)}%`} delta={5.4} />
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        pageSize={10}
        onRowClick={(u) => navigate({ to: "/users/$userId", params: { userId: u.id } })}
        emptyTitle="No users found"
        emptyDescription="Try a different search term or reset the filters."
        toolbar={
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search name, email or user ID…"
            filters={[
              {
                id: "status",
                label: "Status",
                value: status,
                onChange: setStatus,
                options: ["active", "pending", "suspended", "banned"].map((s) => ({ label: s, value: s })),
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
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        destructive={pending?.action !== "refund"}
        title={
          pending?.action === "ban"
            ? "Ban this account?"
            : pending?.action === "suspend"
              ? "Suspend this account?"
              : "Issue a refund?"
        }
        description={`${pending?.user.email} — this action is logged in the audit trail and notifies the account owner.`}
        confirmLabel={pending?.action === "ban" ? "Ban user" : pending?.action === "suspend" ? "Suspend" : "Refund"}
        onConfirm={() => {
          toast.success("Action applied", { description: `${pending?.action} · ${pending?.user.email}` });
          setPending(null);
        }}
      />
    </>
  );
}
