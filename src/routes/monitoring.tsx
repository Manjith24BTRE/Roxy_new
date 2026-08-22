import { createFileRoute } from "@tanstack/react-router";
import { AlertOctagon, Bug, Gauge, ShieldAlert, Terminal } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogTable } from "@/components/kit/LogTable";
import { PageHeader } from "@/components/kit/PageHeader";
import { StatCard } from "@/components/kit/StatCard";
import { useControlCenterData } from "@/lib/control-center-data";

export const Route = createFileRoute("/monitoring")({
  head: () => ({
    meta: [
      { title: "Monitoring — Veytrix Control Centre" },
      {
        name: "description",
        content:
          "Error, API, performance, crash and security telemetry with search and filtering across Veytrix services.",
      },
      { property: "og:title", content: "Monitoring — Veytrix Control Centre" },
      {
        property: "og:description",
        content: "Platform telemetry across every service and endpoint.",
      },
    ],
  }),
  component: Monitoring,
});

const TABS = [
  { id: "error", label: "Error Logs", icon: AlertOctagon },
  { id: "api", label: "API Logs", icon: Terminal },
  { id: "performance", label: "Performance", icon: Gauge },
  { id: "crash", label: "Crash Logs", icon: Bug },
  { id: "security", label: "Security", icon: ShieldAlert },
] as const;

function Monitoring() {
  const { logs } = useControlCenterData();
  return (
    <>
      <PageHeader
        title="Monitoring"
        description="Structured telemetry across the request path, workers and security surfaces."
        breadcrumbs={[{ label: "Monitoring" }]}
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="Errors (24h)"
          value={String(
            logs.filter((log) => log.severity === "error" || log.severity === "critical").length,
          )}
          icon={AlertOctagon}
          tone="danger"
        />
        <StatCard label="Requests (24h)" value="No data available" icon={Terminal} />
        <StatCard label="p95 latency" value="No data available" icon={Gauge} tone="warning" />
        <StatCard
          label="Crashes (24h)"
          value={String(logs.filter((log) => log.kind === "crash").length)}
          icon={Bug}
        />
      </div>

      <Tabs defaultValue="error" className="space-y-3">
        <TabsList className="w-full justify-start overflow-x-auto">
          {TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="gap-1.5 text-xs sm:text-sm">
              <t.icon className="size-3.5" />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map((t) => (
          <TabsContent key={t.id} value={t.id} className="m-0">
            <LogTable entries={logs.filter((l) => l.kind === t.id)} />
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}
