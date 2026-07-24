import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { Play, Star } from "lucide-react";

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: "Templates — VEYTRIX" },
      { name: "description", content: "Beautiful, production-ready templates for shorts, ads, music videos, and documentaries." },
      { property: "og:title", content: "Templates — VEYTRIX" },
      { property: "og:description", content: "Beautiful, production-ready templates for creators." },
    ],
  }),
  component: TemplatesPage,
});

const CATEGORIES = ["All", "Shorts", "Ads", "Music", "Documentary", "Vlog", "Cinematic"] as const;

const TEMPLATES = Array.from({ length: 12 }).map((_, i) => ({
  id: i,
  title: [
    "Neon Pulse", "Halcyon Bloom", "Analog Youth", "Vantablack", "Nocturne",
    "Prism", "Signal Loss", "Kinetic 24", "Overexposed", "Cascade",
    "Interlude", "Aurora Cut",
  ][i],
  tag: ["Shorts", "Ads", "Music", "Cinematic", "Documentary", "Vlog"][i % 6],
  duration: `${(i % 3) + 1}:${(10 + i).toString().padStart(2, "0")}`,
  hue: i % 2 === 0 ? "from-primary/50 to-accent/40" : "from-accent/50 to-primary/40",
}));

function TemplatesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Templates"
        title="Start from something beautiful."
        description="Drop a template into the editor and make it yours. Every template is fully editable, timeline-first, and export-ready."
      />
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c, i) => (
            <button
              key={c}
              className={[
                "rounded-full px-4 py-1.5 text-sm transition hairline",
                i === 0 ? "bg-primary text-primary-foreground" : "bg-surface hover:bg-surface-2 text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <article key={t.id} className="group relative overflow-hidden rounded-xl hairline bg-surface/40">
              <div className="relative aspect-video overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${t.hue}`} />
                <div className="absolute inset-0 bg-mesh opacity-60 group-hover:opacity-100 transition" />
                <div className="absolute inset-0 grid-lines opacity-10" />
                <div className="absolute top-3 left-3 rounded bg-black/50 backdrop-blur px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-white">
                  {t.tag}
                </div>
                <div className="absolute top-3 right-3 rounded bg-black/50 backdrop-blur px-2 py-0.5 text-[10px] font-mono text-white">
                  {t.duration}
                </div>
                <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition">
                  <div className="h-14 w-14 rounded-full bg-white/95 grid place-items-center shadow-glow">
                    <Play className="h-6 w-6 text-black translate-x-0.5" />
                  </div>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{t.title}</div>
                  <div className="text-xs text-muted-foreground">4K · 24fps</div>
                </div>
                <button className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:text-primary hover:bg-surface-2">
                  <Star className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
