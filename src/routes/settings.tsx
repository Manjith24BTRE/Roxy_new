import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Save, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Panel } from "@/components/kit/ChartCard";
import { DataTable, CellStack, Mono, type Column } from "@/components/kit/DataTable";
import { PageHeader } from "@/components/kit/PageHeader";
import { StatusBadge } from "@/components/kit/StatusBadge";
import { relative, useControlCenterData } from "@/lib/control-center-data";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Platform Settings — Veytrix Control Centre" },
      {
        name: "description",
        content:
          "Configure general, security, AI, email, payment, storage and maintenance settings for Veytrix.",
      },
      { property: "og:title", content: "Platform Settings — Veytrix Control Centre" },
      { property: "og:description", content: "Global configuration for the Veytrix platform." },
    ],
  }),
  component: SettingsPage,
});

type Email = ReturnType<typeof useControlCenterData>["emailHistory"][number];

function SettingsPage() {
  const { emailHistory, settingsSections } = useControlCenterData();
  const [values, setValues] = useState<Record<string, string | boolean>>(() =>
    Object.fromEntries(
      settingsSections.flatMap((s) => s.fields.map((f) => [`${s.id}.${f.key}`, f.value])),
    ),
  );

  const emailColumns: Column<Email>[] = [
    {
      key: "to",
      header: "Recipient",
      render: (e) => <CellStack primary={e.to} secondary={e.subject} />,
    },
    {
      key: "template",
      header: "Template",
      render: (e) => <Mono>{e.template}</Mono>,
      hideBelow: "md",
    },
    { key: "status", header: "Status", render: (e) => <StatusBadge status={e.status} /> },
    {
      key: "opens",
      header: "Opens",
      render: (e) => <span className="num">{e.opens}</span>,
      hideBelow: "lg",
    },
    {
      key: "sent",
      header: "Sent",
      render: (e) => <span className="num text-xs">{relative(e.sentAt)}</span>,
      hideBelow: "md",
    },
  ];

  return (
    <>
      <PageHeader
        title="Platform Settings"
        description="Global configuration applied across every Veytrix environment."
        breadcrumbs={[{ label: "System" }, { label: "Settings" }]}
        actions={
          <Button size="sm" onClick={() => toast.success("Settings saved")}>
            <Save className="size-3.5" /> Save changes
          </Button>
        }
      />

      <Tabs defaultValue={settingsSections[0]!.id} className="space-y-3">
        <TabsList className="w-full justify-start overflow-x-auto">
          {settingsSections.map((s) => (
            <TabsTrigger key={s.id} value={s.id} className="text-xs sm:text-sm">
              {s.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {settingsSections.map((s) => (
          <TabsContent key={s.id} value={s.id} className="m-0 space-y-3">
            <Panel
              title={s.title}
              description={`${s.fields.length} settings in this group`}
              bodyClassName="divide-y divide-border"
            >
              {s.fields.map((f) => {
                const id = `${s.id}.${f.key}`;
                const value = values[id];
                return (
                  <div
                    key={id}
                    className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <Label htmlFor={id} className="text-sm">
                        {f.label}
                      </Label>
                      <p className="num text-[11px] text-muted-foreground">{f.key}</p>
                    </div>
                    <div className="sm:w-64">
                      {f.type === "toggle" ? (
                        <Switch
                          id={id}
                          checked={Boolean(value)}
                          onCheckedChange={(v) => setValues((p) => ({ ...p, [id]: v }))}
                        />
                      ) : f.type === "select" ? (
                        <Select
                          value={String(value)}
                          onValueChange={(v) => setValues((p) => ({ ...p, [id]: v }))}
                        >
                          <SelectTrigger id={id} className="h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {("options" in f ? f.options : []).map((o) => (
                              <SelectItem key={o} value={o} className="text-sm">
                                {o}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id={id}
                          value={String(value)}
                          onChange={(e) => setValues((p) => ({ ...p, [id]: e.target.value }))}
                          className="h-9 text-sm"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </Panel>

            {s.id === "email" && (
              <Panel
                title="Recent email delivery"
                description="Last 24 transactional messages"
                bodyClassName="p-0"
                actions={<Mail className="size-4 text-muted-foreground" />}
              >
                <DataTable
                  columns={emailColumns}
                  rows={emailHistory}
                  pageSize={8}
                  emptyTitle="No emails sent"
                />
              </Panel>
            )}

            {s.id === "maintenance" && (
              <Panel title="Danger zone" bodyClassName="flex flex-wrap gap-2 p-4">
                <Button variant="outline" size="sm" onClick={() => toast.success("Caches flushed")}>
                  Flush caches
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success("Search index rebuild queued")}
                >
                  Rebuild search index
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => toast.warning("Maintenance mode armed")}
                >
                  <SettingsIcon className="size-3.5" /> Enter maintenance mode
                </Button>
              </Panel>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}
