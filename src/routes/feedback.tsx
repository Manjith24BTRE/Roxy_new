import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MessageSquare, ThumbsUp } from "lucide-react";
import { DataTable, CellStack, type Column } from "@/components/kit/DataTable";
import { FilterBar } from "@/components/kit/FilterBar";
import { PageHeader } from "@/components/kit/PageHeader";
import { StatCard } from "@/components/kit/StatCard";
import { StatusBadge } from "@/components/kit/StatusBadge";
import { feedback, relative } from "@/lib/mock/data";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "Feedback — Veytrix Control Centre" },
      { name: "description", content: "Customer feedback, feature requests and sentiment signals collected across Veytrix." },
      { property: "og:title", content: "Feedback — Veytrix Control Centre" },
      { property: "og:description", content: "Review customer feedback and feature requests." },
    ],
  }),
  component: FeedbackPage,
});

type Row = (typeof feedback)[number];
const SENTIMENT: Record<string, string> = { positive: "success", neutral: "info", negative: "failed" };

function FeedbackPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [sentiment, setSentiment] = useState("all");

  const rows = useMemo(
    () =>
      feedback.filter(
        (f) =>
          (!search || [f.title, f.user].some((v) => v.toLowerCase().includes(search.toLowerCase()))) &&
          (type === "all" || f.type === type) &&
          (sentiment === "all" || f.sentiment === sentiment),
      ),
    [search, type, sentiment],
  );

  const columns: Column<Row>[] = [
    { key: "title", header: "Feedback", render: (f) => <CellStack primary={f.title} secondary={f.user} /> },
    { key: "type", header: "Type", render: (f) => <span className="text-sm">{f.type}</span>, hideBelow: "md" },
    { key: "sent", header: "Sentiment", render: (f) => <StatusBadge status={SENTIMENT[f.sentiment] ?? "info"} label={f.sentiment} /> },
    { key: "score", header: "Score", render: (f) => <span className="num">{f.score}/10</span>, hideBelow: "lg" },
    {
      key: "votes",
      header: "Votes",
      render: (f) => (
        <span className="num inline-flex items-center gap-1">
          <ThumbsUp className="size-3" /> {f.votes}
        </span>
      ),
      hideBelow: "md",
    },
    { key: "status", header: "Status", render: (f) => <StatusBadge status={f.status} /> },
    { key: "at", header: "Submitted", render: (f) => <span className="num text-xs">{relative(f.createdAt)}</span>, hideBelow: "xl" },
  ];

  const positive = Math.round((feedback.filter((f) => f.sentiment === "positive").length / feedback.length) * 100);

  return (
    <>
      <PageHeader
        title="Feedback"
        description="What customers are asking for, ranked by demand and sentiment."
        breadcrumbs={[{ label: "Support" }, { label: "Feedback" }]}
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Submissions" value={String(feedback.length)} delta={14.6} icon={MessageSquare} />
        <StatCard label="Positive sentiment" value={`${positive}%`} delta={3.3} tone="success" />
        <StatCard label="Feature requests" value={String(feedback.filter((f) => f.type === "Feature Request").length)} delta={9.1} />
        <StatCard label="Avg score" value={(feedback.reduce((a, f) => a + f.score, 0) / feedback.length).toFixed(1)} delta={1.4} />
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        pageSize={10}
        emptyTitle="No feedback"
        toolbar={
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search feedback or customer…"
            filters={[
              {
                id: "type",
                label: "Type",
                value: type,
                onChange: setType,
                options: ["Feature Request", "Bug Report", "Praise", "Complaint"].map((t) => ({ label: t, value: t })),
              },
              {
                id: "sentiment",
                label: "Sentiment",
                value: sentiment,
                onChange: setSentiment,
                options: ["positive", "neutral", "negative"].map((t) => ({ label: t, value: t })),
              },
            ]}
            onReset={() => {
              setSearch("");
              setType("all");
              setSentiment("all");
            }}
          />
        }
      />
    </>
  );
}
