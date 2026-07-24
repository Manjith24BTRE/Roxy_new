import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles, Zap, Layers, Wand2, Film, MonitorPlay,
  Cpu, AudioWaveform, Type, Palette, Download, Cloud,
  ChevronRight, Play, ArrowUpRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VEYTRIX — Video editing, reimagined" },
      { name: "description", content: "Cinematic timeline, live preview, and an AI-ready workflow. VEYTRIX is the next-generation video editor." },
      { property: "og:title", content: "VEYTRIX — Video editing, reimagined" },
      { property: "og:description", content: "Cinematic timeline, live preview, and an AI-ready workflow." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="relative">
      <Hero />
      <FeatureCards />
      <WhyVeytrix />
      <Showcase />
      <FAQ />
      <CTA />
    </main>
  );
}

/* ---------------- HERO ---------------- */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh opacity-90 pointer-events-none" />
      <div className="absolute inset-0 grid-lines opacity-[0.06] pointer-events-none" />
      <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-primary/25 blur-[140px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="flex justify-center">
          <div className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse-glow absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="text-muted-foreground">
              VEYTRIX v0.1 · <span className="text-foreground">public beta live</span>
            </span>
          </div>
        </div>

        <h1 className="mt-8 text-center font-display text-5xl md:text-7xl font-bold tracking-tight">
          Video editing,{" "}
          <span className="text-gradient">reimagined</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-muted-foreground">
          A cinematic timeline. A live preview that never blinks. A workflow
          engineered for the next generation of creators — precise, playful, ready
          for AI when you are.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/editor"
            className="inline-flex items-center gap-2 rounded-md bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95 transition"
          >
            <Play className="h-4 w-4" /> Launch Editor
          </Link>
          <Link
            to="/templates"
            className="inline-flex items-center gap-2 rounded-md hairline-strong bg-surface/70 px-6 py-3 text-sm font-medium hover:bg-surface-2 transition"
          >
            Browse Templates <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Editor preview mock */}
        <div className="relative mx-auto mt-16 max-w-6xl">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-primary opacity-30 blur-2xl" />
          <div className="relative rounded-2xl glass shadow-elegant overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 bg-surface/60">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
              <div className="mx-auto text-xs font-mono text-muted-foreground">
                veytrix / untitled-project.vxp
              </div>
            </div>
            <div className="grid grid-cols-[64px_1fr_260px]">
              {/* Left rail */}
              <div className="border-r border-border p-3 flex flex-col gap-3 items-center">
                {[Film, Type, Palette, AudioWaveform, Layers, Wand2].map((I, i) => (
                  <div
                    key={i}
                    className={[
                      "h-9 w-9 grid place-items-center rounded-md transition",
                      i === 0
                        ? "bg-primary/15 text-primary hairline-strong"
                        : "text-muted-foreground hover:bg-surface-2",
                    ].join(" ")}
                  >
                    <I className="h-4 w-4" />
                  </div>
                ))}
              </div>

              {/* Preview */}
              <div className="p-4">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-accent/30 to-transparent" />
                  <div className="absolute inset-0 bg-mesh opacity-70" />
                  <div className="absolute inset-0 grid-lines opacity-10" />
                  <div className="absolute inset-x-6 top-6 flex items-center gap-2 text-xs font-mono text-foreground/80">
                    <span className="rounded bg-black/40 px-2 py-0.5">4K · 24fps</span>
                    <span className="rounded bg-black/40 px-2 py-0.5">Rec. 709</span>
                    <span className="ml-auto rounded bg-primary/80 text-primary-foreground px-2 py-0.5">
                      LIVE
                    </span>
                  </div>
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-white/90 grid place-items-center shadow-glow animate-pulse-glow">
                    <Play className="h-6 w-6 text-black translate-x-0.5" />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="h-1 rounded-full bg-white/10">
                      <div className="h-1 rounded-full bg-gradient-primary w-1/3" />
                    </div>
                    <div className="mt-1 flex justify-between text-[10px] font-mono text-white/70">
                      <span>00:00:12:04</span>
                      <span>00:00:37:18</span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="mt-4 rounded-lg hairline bg-surface/60 p-3">
                  <div className="flex items-center gap-3 mb-2 text-[10px] font-mono text-muted-foreground">
                    <span>TIMELINE</span>
                    <span>·</span>
                    <span>3 TRACKS</span>
                    <span className="ml-auto">ZOOM 120%</span>
                  </div>
                  {[
                    { label: "V1", color: "from-primary/70 to-primary/40", w: "w-3/4" },
                    { label: "V2", color: "from-accent/70 to-accent/30", w: "w-1/2" },
                    { label: "A1", color: "from-success/70 to-success/30", w: "w-2/3" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-2 py-1">
                      <span className="w-6 text-[10px] font-mono text-muted-foreground">
                        {row.label}
                      </span>
                      <div className="relative flex-1 h-6 rounded bg-surface-2 overflow-hidden">
                        <div
                          className={`absolute inset-y-0 left-2 ${row.w} rounded bg-gradient-to-r ${row.color}`}
                        />
                        <div className="absolute inset-y-0 left-[38%] w-px bg-primary/80" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Properties panel */}
              <div className="border-l border-border p-4 bg-surface/40">
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Properties
                </div>
                <div className="mt-3 space-y-3">
                  {[
                    ["Opacity", "100%"],
                    ["Scale", "1.00x"],
                    ["Rotation", "0.0°"],
                    ["Blend", "Normal"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-mono">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-md bg-gradient-primary/10 hairline p-3">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-primary">
                    AI Command
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground italic">
                    reserved · coming soon
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- FEATURE CARDS ---------------- */
const FEATURES = [
  { icon: Film,        title: "Cinematic Timeline",  desc: "Multi-track editing with ripple, snap, and layer control that stays out of your way." },
  { icon: MonitorPlay, title: "Live Preview",        desc: "Frame-accurate playback with safe area, grid, and zoom — no re-renders required." },
  { icon: AudioWaveform,    title: "Advanced Audio",      desc: "AudioWaveform scrubbing, ducking, and mixing tuned for creators, not engineers." },
  { icon: Palette,     title: "Color & Filters",     desc: "Grade with confidence — LUTs, curves, and cinematic filters at your fingertips." },
  { icon: Wand2,       title: "Effects & Animation", desc: "Keyframe motion, transitions, and shaders that snap into place." },
  { icon: Download,    title: "Export Center",       desc: "Resolution, FPS, codec, bitrate — every knob, one clean panel." },
] as const;

function FeatureCards() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-widest text-primary">
            The toolkit
          </div>
          <h2 className="mt-3 text-3xl md:text-5xl font-display font-bold tracking-tight">
            Every tool. In one <span className="text-gradient">focused</span> workspace.
          </h2>
          <p className="mt-4 text-muted-foreground">
            A modular editor built on strict boundaries — every module does one
            thing and does it beautifully.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <article
              key={f.title}
              className="group relative overflow-hidden rounded-xl hairline bg-surface/50 p-6 transition hover:bg-surface-2"
            >
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition" />
              <div className="relative">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary hairline-strong">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
                <div className="mt-6 flex items-center gap-1 text-xs font-mono text-primary/80 opacity-0 group-hover:opacity-100 transition">
                  learn more <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- WHY VEYTRIX ---------------- */
function WhyVeytrix() {
  const rows = [
    { icon: Zap,      title: "Instantaneous",  desc: "Zero-latency preview. Every scrub is real." },
    { icon: Cpu,      title: "Engineered",     desc: "Enterprise architecture. Modular by design." },
    { icon: Sparkles, title: "Delightful",     desc: "Tuned motion, tuned typography, tuned taste." },
    { icon: Cloud,    title: "Cloud-ready",    desc: "Projects sync when you're ready. Local first." },
  ];
  return (
    <section className="relative py-24 border-t border-border">
      <div className="mx-auto max-w-7xl px-6 grid gap-12 md:grid-cols-2 items-center">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-primary">
            Why VEYTRIX
          </div>
          <h2 className="mt-3 text-3xl md:text-5xl font-display font-bold tracking-tight">
            Built for creators who <span className="text-gradient">refuse to compromise</span>.
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg">
            We didn't rebuild a video editor. We rethought the surface between
            you and your footage — every gesture, every glance, every render.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.title} className="rounded-xl hairline bg-surface/50 p-5">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gradient-primary text-primary-foreground">
                <r.icon className="h-4 w-4" />
              </div>
              <div className="mt-4 font-semibold">{r.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- SHOWCASE ---------------- */
function Showcase() {
  const cards = [
    { tag: "SHORT FILM",   title: "Nocturne / 04:12",     hue: "from-primary/40 to-accent/40" },
    { tag: "AD SPOT",      title: "Halcyon Coffee / 0:30", hue: "from-accent/40 to-primary/40" },
    { tag: "MUSIC VIDEO",  title: "Vantablack / 03:47",   hue: "from-primary/30 to-primary/60" },
    { tag: "DOCUMENTARY",  title: "Analog Youth / 12:03", hue: "from-accent/30 to-accent/60" },
  ];
  return (
    <section className="relative py-24 border-t border-border">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-primary">Showcase</div>
            <h2 className="mt-3 text-3xl md:text-5xl font-display font-bold tracking-tight">
              Cut in VEYTRIX.
            </h2>
          </div>
          <Link to="/templates" className="hidden md:inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            All templates <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <div key={c.title} className="group relative aspect-[4/5] rounded-xl overflow-hidden hairline">
              <div className={`absolute inset-0 bg-gradient-to-br ${c.hue}`} />
              <div className="absolute inset-0 bg-mesh opacity-60 group-hover:opacity-100 transition" />
              <div className="absolute inset-0 grid-lines opacity-10" />
              <div className="absolute inset-0 flex flex-col justify-end p-5">
                <div className="text-[10px] font-mono uppercase tracking-widest text-white/80">
                  {c.tag}
                </div>
                <div className="mt-1 font-display text-lg font-semibold text-white">
                  {c.title}
                </div>
              </div>
              <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/40 grid place-items-center backdrop-blur">
                <Play className="h-3.5 w-3.5 text-white translate-x-0.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
const FAQS = [
  { q: "Is VEYTRIX free to use?", a: "The public beta is free while we harden the core. Pricing tiers are coming with export watermark removal and cloud sync." },
  { q: "What formats and codecs are supported?", a: "The Export Center will support common resolutions up to 4K, 24–120 FPS, H.264/H.265, and ProRes. Deeper codec support is on the roadmap." },
  { q: "Does VEYTRIX include AI features?", a: "The AI Command Engine is reserved for a future release. The scaffold is in place; we're building it with the same care as the timeline." },
  { q: "Can I self-host or use it offline?", a: "The editor runs locally in your browser. Cloud sync, templates, and shared projects are optional and opt-in." },
  { q: "Do you have a keyboard-first workflow?", a: "Yes — every module is reachable from the command palette and keybindings are fully remappable." },
];

function FAQ() {
  return (
    <section className="relative py-24 border-t border-border">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center">
          <div className="text-xs font-mono uppercase tracking-widest text-primary">FAQ</div>
          <h2 className="mt-3 text-3xl md:text-5xl font-display font-bold tracking-tight">
            Questions, answered.
          </h2>
        </div>
        <div className="mt-12 divide-y divide-border rounded-xl hairline bg-surface/40">
          {FAQS.map((f) => (
            <details key={f.q} className="group p-5">
              <summary className="flex cursor-pointer items-center justify-between list-none gap-4">
                <span className="font-medium">{f.q}</span>
                <span className="grid h-7 w-7 place-items-center rounded-full hairline text-primary transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- CTA ---------------- */
function CTA() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-2xl hairline-strong bg-gradient-to-br from-surface via-surface-2 to-surface p-10 md:p-16">
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-primary/25 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative text-center">
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
              Roll tape. <span className="text-gradient">Cut something great.</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Open the editor and drop your first clip on the timeline in under ten seconds.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/editor"
                className="inline-flex items-center gap-2 rounded-md bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-95 transition"
              >
                <Play className="h-4 w-4" /> Launch Editor
              </Link>
              <Link
                to="/learning"
                className="inline-flex items-center gap-2 rounded-md hairline-strong bg-surface/70 px-6 py-3 text-sm font-medium hover:bg-surface-2 transition"
              >
                Watch a tutorial
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
