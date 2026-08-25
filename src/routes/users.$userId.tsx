import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Ban, Coins, CreditCard, ShieldOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityTimeline } from "@/components/kit/ActivityTimeline";
import { ConfirmationDialog } from "@/components/kit/ConfirmDialog";
import { Panel } from "@/components/kit/ChartCard";
import { PageHeader } from "@/components/kit/PageHeader";
import { StatCard } from "@/components/kit/StatCard";
import { StatusBadge } from "@/components/kit/StatusBadge";
import { EmptyState } from "@/components/kit/States";
import {
  creditTransactions,
  fmtDate,
  fmtDateTime,
  jobs,
  money,
  relative,
  sessions,
  tickets,
  transactions,
  users,
} from "@/lib/mock/data";

export const Route = createFileRoute("/users/$userId")({
  loader: ({ params }) => {
    const user = users.find((u) => u.id === params.userId);
    if (!user) throw notFound();
    return { user };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "User unavailable — Veytrix" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `${loaderData.user.name} — Veytrix Control Centre` },
        { name: "description", content: `Account overview, subscription, credits, usage and support history for ${loaderData.user.email}.` },
        { property: "og:title", content: `${loaderData.user.name} — Veytrix Control Centre` },
        { property: "og:description", content: "Detailed account record in the Veytrix control centre." },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: UserDetail,
});

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function UserDetail() {
  const { user } = Route.useLoaderData();
  const [pending, setPending] = useState<null | "suspend" | "ban">(null);

  const userJobs = jobs.slice(0, 6);
  const userTx = transactions.slice(0, 5);
  const userCredits = creditTransactions.slice(0, 6);
  const userSessions = sessions.slice(0, 4);
  const userTickets = tickets.slice(0, 3);

  return (
    <>
      <PageHeader
        title={user.name}
        description={user.email}
        breadcrumbs={[{ label: "Users", to: "/users" }, { label: user.id }]}
        meta={
          <>
            <StatusBadge status={user.status} />
            <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-xs">{user.plan}</span>
            <span className="num rounded-md border border-border bg-surface px-2 py-0.5 text-xs text-muted-foreground">
              Joined {fmtDate(user.createdAt)}
            </span>
          </>
        }
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/users">
                <ArrowLeft className="size-3.5" /> Back
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPending("suspend")}>
              <ShieldOff className="size-3.5" /> Suspend
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPending("ban")}>
              <Ban className="size-3.5" /> Ban
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Credit balance" value={user.credits.toLocaleString()} icon={Coins} />
        <StatCard label="MRR" value={money(user.mrr)} icon={CreditCard} tone="success" />
        <StatCard label="Quota usage" value={`${user.usage}%`} tone={user.usage > 80 ? "warning" : "default"} />
        <StatCard label="Last login" value={relative(user.lastLogin)} />
      </div>

      <Tabs defaultValue="overview" className="space-y-3">
        <TabsList className="w-full justify-start overflow-x-auto">
          {["overview", "profile", "subscription", "credits", "usage", "logins", "sessions", "transactions", "tickets"].map((t) => (
            <TabsTrigger key={t} value={t} className="text-xs capitalize sm:text-sm">
              {t === "logins" ? "Login history" : t}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="m-0 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <Panel title="Account summary">
            <Row label="User ID" value={<span className="font-mono text-xs">{user.id}</span>} />
            <Row label="Role" value={user.role} />
            <Row label="Country" value={user.country} />
            <Row label="Two-factor" value={<StatusBadge status={user.twoFactor ? "enabled" : "disabled"} />} />
            <Row label="Status" value={<StatusBadge status={user.status} />} />
          </Panel>
          <Panel title="Recent activity">
            <ActivityTimeline
              items={userJobs.slice(0, 5).map((j) => ({
                id: j.id,
                title: `${j.model} job ${j.status}`,
                description: `${j.tokens.toLocaleString()} tokens · ${j.credits} credits`,
                at: relative(j.startedAt),
                tone: j.status === "failed" ? ("danger" as const) : ("info" as const),
              }))}
            />
          </Panel>
        </TabsContent>

        <TabsContent value="profile" className="m-0">
          <Panel title="Profile">
            <Row label="Full name" value={user.name} />
            <Row label="Email" value={user.email} />
            <Row label="Country" value={user.country} />
            <Row label="Created" value={fmtDateTime(user.createdAt)} />
            <Row label="Workspace role" value={user.role} />
          </Panel>
        </TabsContent>

        <TabsContent value="subscription" className="m-0">
          <Panel title="Subscription">
            <Row label="Plan" value={user.plan} />
            <Row label="Billing cycle" value={user.plan === "Enterprise" ? "Annual" : "Monthly"} />
            <Row label="MRR" value={money(user.mrr)} />
            <Row label="Renewal" value={fmtDate(user.createdAt)} />
            <Row label="Status" value={<StatusBadge status="active" />} />
          </Panel>
        </TabsContent>

        <TabsContent value="credits" className="m-0">
          <Panel title="Credit ledger">
            {userCredits.map((c) => (
              <Row
                key={c.id}
                label={`${c.type} · ${relative(c.date)}`}
                value={<span className={c.amount < 0 ? "num text-destructive" : "num text-success"}>{c.amount.toLocaleString()}</span>}
              />
            ))}
          </Panel>
        </TabsContent>

        <TabsContent value="usage" className="m-0">
          <Panel title="Quota usage" bodyClassName="p-4 space-y-4">
            {[
              ["Credits", user.usage],
              ["API requests", Math.min(99, user.usage + 12)],
              ["Storage", Math.max(4, user.usage - 30)],
            ].map(([label, v]) => (
              <div key={String(label)}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="num">{v}%</span>
                </div>
                <Progress value={Number(v)} className="mt-1.5 h-1.5" />
              </div>
            ))}
          </Panel>
        </TabsContent>

        <TabsContent value="logins" className="m-0">
          <Panel title="Login history">
            {userSessions.map((s) => (
              <Row key={s.id} label={`${s.device} · ${s.location}`} value={<span className="num text-xs">{relative(s.startedAt)}</span>} />
            ))}
          </Panel>
        </TabsContent>

        <TabsContent value="sessions" className="m-0">
          <Panel title="Active sessions">
            {userSessions.map((s) => (
              <Row key={s.id} label={`${s.ip} · ${s.device}`} value={<StatusBadge status={s.status} />} />
            ))}
          </Panel>
        </TabsContent>

        <TabsContent value="transactions" className="m-0">
          <Panel title="Transactions">
            {userTx.map((t) => (
              <Row key={t.id} label={`${t.invoice} · ${fmtDate(t.date)}`} value={<span className="num">{money(t.amount)}</span>} />
            ))}
          </Panel>
        </TabsContent>

        <TabsContent value="tickets" className="m-0">
          <Panel title="Support tickets">
            {userTickets.length === 0 ? (
              <EmptyState title="No tickets" description="This account has never contacted support." />
            ) : (
              userTickets.map((t) => <Row key={t.id} label={t.subject} value={<StatusBadge status={t.status} />} />)
            )}
          </Panel>
        </TabsContent>
      </Tabs>

      <ConfirmationDialog
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        destructive
        title={pending === "ban" ? "Ban this account?" : "Suspend this account?"}
        description={`${user.email} will lose access immediately. The action is recorded in the audit log.`}
        confirmLabel={pending === "ban" ? "Ban user" : "Suspend user"}
        onConfirm={() => {
          toast.success(pending === "ban" ? "User banned" : "User suspended", { description: user.email });
          setPending(null);
        }}
      />
    </>
  );
}
