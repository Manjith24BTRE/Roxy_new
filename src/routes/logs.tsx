import { createFileRoute } from "@tanstack/react-router";
import { Download, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LogTable } from "@/components/kit/LogTable";
import { PageHeader } from "@/components/kit/PageHeader";
import { StatCard } from "@/components/kit/StatCard";
import { logs } from "@/lib/mock/data";

export const Route = createFileRoute("/logs")({
  head: () => ({
    meta: [
      { title: "Logs — Veytrix Control Centre" },
      {
        name: "description",
        content:
          "Unified, searchable log stream across every Veytrix service, endpoint and severity level.",
      },
      { property: "og:title", content: "Logs — Veytrix Control Centre" },
      { property: "og:description", content: "Unified searchable log stream for the Veytrix platform." },
    ],
  }),
  component: LogsPage,
});

function LogsPage() {
  const errors = logs.filter((l) => l.severity === "error" || l.severity === "critical").length;
  return (
    <>
      <PageHeader
        title="Logs"
        description="Every structured log line emitted by the platform in the retention window."
        breadcrumbs={[{ label: "Logs" }]}
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.success("Export queued", { description: "You will receive an email when the archive is ready." })}
          >
            <Download className="size-3.5" /> Export archive
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Lines retained" value={logs.length.toLocaleString()} icon={ScrollText} footer="14-day retention" />
        <StatCard label="Error + critical" value={errors.toLocaleString()} delta={-4.1} invertDelta tone="danger" />
        <StatCard label="Ingest rate" value="18.4k/min" delta={2.2} />
        <StatCard label="Indexed volume" value="742 GB" delta={7.8} />
      </div>
      <LogTable entries={logs} />
    </>
  );
}
