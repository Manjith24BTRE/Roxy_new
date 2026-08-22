import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Activity as ActivityIcon } from "lucide-react";
import { DataTable, CellStack, type Column } from "@/components/kit/DataTable";
import { FilterBar } from "@/components/kit/FilterBar";
import { PageHeader } from "@/components/kit/PageHeader";
import { StatCard } from "@/components/kit/StatCard";
import { fmtDateTime, relative, useControlCenterData } from "@/lib/control-center-data";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Activity — Veytrix Control Centre" },
      {
        name: "description",
        content:
          "Chronological feed of user and administrator activity across every Veytrix channel.",
      },
      { property: "og:title", content: "Activity — Veytrix Control Centre" },
      { property: "og:description", content: "Platform-wide activity feed." },
    ],
  }),
  component: ActivityPage,
});

type Row = ReturnType<typeof useControlCenterData>["activity"][number];

function ActivityPage() {
  const { activity } = useControlCenterData();
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("all");

  const rows = useMemo(
    () =>
      activity.filter((a) => {
        const q = search.toLowerCase();
        return (
          (!q || [a.actor, a.action].some((f) => f.toLowerCase().includes(q))) &&
          (channel === "all" || a.channel === channel)
        );
      }),
    [search, channel],
  );

  const columns: Column<Row>[] = [
    {
      key: "actor",
      header: "Actor",
      render: (a) => <CellStack primary={a.actor} secondary={a.channel} />,
    },
    { key: "action", header: "Action", render: (a) => <span className="text-sm">{a.action}</span> },
    {
      key: "channel",
      header: "Channel",
      render: (a) => <span className="text-xs text-muted-foreground">{a.channel}</span>,
      hideBelow: "md",
    },
    {
      key: "at",
      header: "When",
      render: (a) => <span className="num text-xs">{fmtDateTime(a.at).slice(0, 16)}</span>,
      hideBelow: "lg",
    },
    {
      key: "rel",
      header: "",
      render: (a) => <span className="num text-xs text-muted-foreground">{relative(a.at)}</span>,
    },
  ];

  return (
    <>
      <PageHeader
        title="Activity"
        description="Everything that happened on the platform, newest first."
        breadcrumbs={[{ label: "Activity" }]}
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Events (24h)" value={String(activity.length)} icon={ActivityIcon} />
        <StatCard label="Via API" value="No data available" />
        <StatCard label="Admin actions" value="No data available" />
        <StatCard
          label="Unique actors"
          value={String(new Set(activity.map((item) => item.actor)).size)}
        />
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        pageSize={12}
        emptyTitle="No activity"
        toolbar={
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search actor or action…"
            filters={[
              {
                id: "channel",
                label: "Channel",
                value: channel,
                onChange: setChannel,
                options: ["Web App", "API", "Admin Console", "Mobile"].map((c) => ({
                  label: c,
                  value: c,
                })),
              },
            ]}
            onReset={() => {
              setSearch("");
              setChannel("all");
            }}
          />
        }
      />
    </>
  );
}
