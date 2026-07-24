import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { BookOpen, Play, Clock, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/learning")({
  head: () => ({
    meta: [
      { title: "Learning Center — VEYTRIX" },
      { name: "description", content: "Guides, tutorials, and shortcuts to master the VEYTRIX editor." },
      { property: "og:title", content: "Learning Center — VEYTRIX" },
      { property: "og:description", content: "Guides, tutorials, and shortcuts to master VEYTRIX." },
    ],
  }),
  component: LearningPage,
});

const PATHS = [
  { icon: GraduationCap, title: "Getting Started", lessons: 8, time: "40 min" },
  { icon: Play,          title: "Timeline Mastery", lessons: 12, time: "1h 20m" },
  { icon: BookOpen,      title: "Color & Grading",  lessons: 10, time: "1h 05m" },
  { icon: Clock,         title: "Motion & Keyframes", lessons: 9, time: "55 min" },
];

const TUTORIALS = [
  "Your first cut in 60 seconds",
  "Ripple editing without regret",
  "Snap, split, slip: precision on the timeline",
  "Color grading with LUTs",
  "Audio ducking done right",
  "Exporting for social vs cinema",
];

function LearningPage() {
  return (
    <>
      <PageHeader
        eyebrow="Learning Center"
        title="Learn VEYTRIX in an afternoon."
        description="Short, focused lessons written by editors — not by product marketers."
      />
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {PATHS.map((p) => (
            <div key={p.title} className="rounded-xl hairline bg-surface/40 p-5 hover:bg-surface-2 transition cursor-pointer">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-gradient-primary text-primary-foreground">
                <p.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 font-semibold">{p.title}</div>
              <div className="mt-1 text-xs text-muted-foreground font-mono">
                {p.lessons} lessons · {p.time}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <h2 className="font-display text-2xl font-semibold">Popular tutorials</h2>
          <ul className="mt-6 divide-y divide-border rounded-xl hairline bg-surface/40">
            {TUTORIALS.map((t, i) => (
              <li key={t} className="flex items-center gap-4 p-4 hover:bg-surface-2 transition cursor-pointer">
                <span className="w-8 text-sm font-mono text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">{t}</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {3 + (i % 6)} min
                </span>
                <Play className="h-4 w-4 text-primary" />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
